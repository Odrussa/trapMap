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
        $baseQuery = '
            SELECT
                a.nome_artista AS nome,
                a.alias,
                a.provincia,
                a.regione,
                a.spotify,
                a.instagram,
                a.soundcloud,
                a.foto AS immagine,
                GROUP_CONCAT(c.name SEPARATOR ", ") AS categorie
            FROM artists_card a
            LEFT JOIN artist_categories ac ON a.id = ac.artist_id
            LEFT JOIN categories c ON ac.category_id = c.id
        ';

        $parameters = [];

        $filters = [];

        $baseQuery .= ' WHERE a.stato IN ("verified", "claimed")';

        if ($province) {
            $filters[] = 'a.provincia = :provincia';
            $parameters['provincia'] = $province;
        }

        if ($filters) {
            $baseQuery .= ' AND ' . implode(' AND ', $filters);
        }

        // Raggruppa per artista
        $baseQuery .= ' GROUP BY a.id';

        $statement = $this->connection->prepare($baseQuery);
        $statement->execute($parameters);
        $artists = $statement->fetchAll(PDO::FETCH_ASSOC);

        // Sanitizzazione base
        foreach ($artists as &$artist) {
            foreach ($artist as $key => $value) {
                $artist[$key] = htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }
        }

        return $artists;
    }

    public function userHasArtistCard(int $userId): bool
    {
        $statement = $this->connection->prepare('SELECT COUNT(*) FROM artists_card WHERE user_id = :user_id');
        $statement->execute(['user_id' => $userId]);

        return (bool) $statement->fetchColumn();
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
