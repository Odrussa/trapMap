<?php
/**
 * Gestisce il recupero dei dati relativi agli artisti.
 */
class ArtistRepository
{
    public const VISIBLE_STATUSES = ['verified', 'claimed'];

    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function findByProvince(?string $province = null): array
    {
        $selectColumns = [
            'a.nome_artista AS nome',
            'a.alias',
            'a.provincia',
            'a.regione',
            'a.spotify',
            'a.instagram',
            'a.soundcloud',
            'a.foto AS immagine',
            'GROUP_CONCAT(c.name SEPARATOR ", ") AS categorie',
        ];

        $baseFrom = '
            FROM artists_card a
            LEFT JOIN artist_categories ac ON a.id = ac.artist_id
            LEFT JOIN categories c ON ac.category_id = c.id
        ';

        $parameters = [];

        if ($province) {
            $parameters['provincia'] = $province;
        }

        $queryWithStatus = 'SELECT ' . implode(",\n                ", array_merge($selectColumns, ['a.stato AS stato'])) . $baseFrom;
        $queryWithoutStatus = 'SELECT ' . implode(",\n                ", $selectColumns) . $baseFrom;

        $conditions = [];

        if ($province) {
            $conditions[] = 'a.provincia = :provincia';
        }

        if ($conditions) {
            $whereClause = ' WHERE ' . implode(' AND ', $conditions);
            $queryWithStatus .= $whereClause;
            $queryWithoutStatus .= $whereClause;
        }

        $queryWithStatus .= ' GROUP BY a.id';
        $queryWithoutStatus .= ' GROUP BY a.id';

        try {
            $statement = $this->connection->prepare($queryWithStatus);
            $statement->execute($parameters);
            $artists = $statement->fetchAll(PDO::FETCH_ASSOC);

            $artists = array_values(array_filter($artists, function (array $artist): bool {
                $status = $artist['stato'] ?? null;

                // Mostra comunque gli artisti se il campo non è presente o vuoto per
                // mantenere la compatibilità con i dati esistenti, ma filtra i valori
                // espliciti che non sono stati verificati.
                if ($status === null || $status === '') {
                    return true;
                }

                $normalized = strtolower(trim((string)$status));

                if (is_numeric($status)) {
                    return (int)$status === 1;
                }

                return in_array($normalized, self::VISIBLE_STATUSES, true);
            }));

            foreach ($artists as &$artist) {
                unset($artist['stato']);
                foreach ($artist as $key => $value) {
                    $artist[$key] = htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
                }
            }

            return $artists;
        } catch (\PDOException $exception) {
            error_log('ArtistRepository::findByProvince fallback: ' . $exception->getMessage());
        }

        // Fallback legacy: se la colonna "stato" non esiste ancora, eseguiamo la query originale.
        $statement = $this->connection->prepare($queryWithoutStatus);
        $statement->execute($parameters);
        $artists = $statement->fetchAll(PDO::FETCH_ASSOC);

        foreach ($artists as &$artist) {
            foreach ($artist as $key => $value) {
                $artist[$key] = htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }
        }

        return $artists;
    }

    public function userHasArtistCard(int $userId): bool
    {
        try {
            $statement = $this->connection->prepare('SELECT COUNT(*) FROM artists_card WHERE user_id = :user_id');
            $statement->execute(['user_id' => $userId]);

            return (bool) $statement->fetchColumn();
        } catch (\PDOException $exception) {
            error_log('ArtistRepository::userHasArtistCard legacy column missing: ' . $exception->getMessage());
        }

        return false;
    }

    public function existsByNameOrAlias(string $name, ?string $alias, ?int $excludeId = null): bool
    {
        $sql = 'SELECT COUNT(*) FROM artists_card WHERE (LOWER(nome_artista) = LOWER(:nome)';
        $params = ['nome' => $name];

        if ($alias !== null && $alias !== '') {
            $sql .= ' OR LOWER(alias) = LOWER(:alias)';
            $params['alias'] = $alias;
        }

        $sql .= ')';

        if ($excludeId !== null) {
            $sql .= ' AND id <> :exclude_id';
            $params['exclude_id'] = $excludeId;
        }

        $statement = $this->connection->prepare($sql);
        $statement->execute($params);

        return (bool) $statement->fetchColumn();
    }

    public function create(array $data, array $categoryIds = []): int
    {
        $sql = 'INSERT INTO artists_card (
            user_id,
            nome_artista,
            alias,
            provincia,
            regione,
            spotify,
            instagram,
            soundcloud,
            stato
        ) VALUES (
            :user_id,
            :nome_artista,
            :alias,
            :provincia,
            :regione,
            :spotify,
            :instagram,
            :soundcloud,
            :stato
        )';

        $statement = $this->connection->prepare($sql);
        $statement->execute([
            'user_id' => $data['user_id'] ?? null,
            'nome_artista' => $data['nome_artista'],
            'alias' => $data['alias'],
            'provincia' => $data['provincia'],
            'regione' => $data['regione'],
            'spotify' => $data['spotify'],
            'instagram' => $data['instagram'],
            'soundcloud' => $data['soundcloud'],
            'stato' => $data['stato'],
        ]);

        $artistId = (int) $this->connection->lastInsertId();

        $this->syncCategories($artistId, $categoryIds);

        return $artistId;
    }

    public function update(int $artistId, array $data, array $categoryIds = []): void
    {
        $sql = 'UPDATE artists_card SET
            nome_artista = :nome_artista,
            alias = :alias,
            provincia = :provincia,
            regione = :regione,
            spotify = :spotify,
            instagram = :instagram,
            soundcloud = :soundcloud,
            stato = :stato
        WHERE id = :id';

        $statement = $this->connection->prepare($sql);
        $statement->execute([
            'nome_artista' => $data['nome_artista'],
            'alias' => $data['alias'],
            'provincia' => $data['provincia'],
            'regione' => $data['regione'],
            'spotify' => $data['spotify'],
            'instagram' => $data['instagram'],
            'soundcloud' => $data['soundcloud'],
            'stato' => $data['stato'],
            'id' => $artistId,
        ]);

        $this->syncCategories($artistId, $categoryIds);
    }

    public function syncCategories(int $artistId, array $categoryIds): void
    {
        $deleteStatement = $this->connection->prepare('DELETE FROM artist_categories WHERE artist_id = :artist_id');
        $deleteStatement->execute(['artist_id' => $artistId]);

        if (!$categoryIds) {
            return;
        }

        $insertStatement = $this->connection->prepare('INSERT INTO artist_categories (artist_id, category_id) VALUES (:artist_id, :category_id)');

        foreach ($categoryIds as $categoryId) {
            $insertStatement->execute([
                'artist_id' => $artistId,
                'category_id' => $categoryId,
            ]);
        }
    }

    public function findByUserId(int $userId): ?array
    {
        $sql = 'SELECT id, nome_artista, alias, provincia, regione, spotify, instagram, soundcloud, stato
                FROM artists_card
                WHERE user_id = :user_id
                LIMIT 1';

        $statement = $this->connection->prepare($sql);
        $statement->execute(['user_id' => $userId]);

        $result = $statement->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    public function findWithCategoriesByUserId(int $userId): ?array
    {
        $sql = 'SELECT a.id, a.nome_artista, a.alias, a.provincia, a.regione, a.spotify, a.instagram, a.soundcloud, a.stato,
                       GROUP_CONCAT(c.slug) AS categorie
                FROM artists_card a
                LEFT JOIN artist_categories ac ON a.id = ac.artist_id
                LEFT JOIN categories c ON ac.category_id = c.id
                WHERE a.user_id = :user_id
                GROUP BY a.id';

        $statement = $this->connection->prepare($sql);
        $statement->execute(['user_id' => $userId]);

        $result = $statement->fetch(PDO::FETCH_ASSOC);

        return $result ?: null;
    }

    public function updateStatus(int $artistId, string $status): void
    {
        $statement = $this->connection->prepare('UPDATE artists_card SET stato = :stato WHERE id = :id');
        $statement->execute([
            'stato' => $status,
            'id' => $artistId,
        ]);
    }
}
