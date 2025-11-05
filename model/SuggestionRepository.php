<?php
/**
 * Gestisce i suggerimenti inviati dagli utenti.
 */
class SuggestionRepository
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function create(array $data): int
    {
        $sql = 'INSERT INTO suggestions (
            user_id,
            nome_artista,
            alias,
            categoria,
            provincia,
            instagram_facebook,
            spotify,
            soundcloud,
            commento,
            created_at,
            status
        ) VALUES (
            :user_id,
            :nome_artista,
            :alias,
            :categoria,
            :provincia,
            :instagram_facebook,
            :spotify,
            :soundcloud,
            :commento,
            NOW(),
            :status
        )';

        $statement = $this->connection->prepare($sql);
        $statement->execute([
            'user_id' => $data['user_id'] ?? null,
            'nome_artista' => $data['nome_artista'],
            'alias' => $data['alias'],
            'categoria' => $data['categoria'],
            'provincia' => $data['provincia'],
            'instagram_facebook' => $data['instagram_facebook'],
            'spotify' => $data['spotify'],
            'soundcloud' => $data['soundcloud'],
            'commento' => $data['commento'],
            'status' => $data['status'] ?? 'pending',
        ]);

        return (int) $this->connection->lastInsertId();
    }

    public function existsDuplicate(string $name, ?string $alias): bool
    {
        $sql = 'SELECT COUNT(*) FROM suggestions WHERE LOWER(nome_artista) = LOWER(:nome)';
        $params = ['nome' => $name];

        if ($alias !== null && $alias !== '') {
            $sql .= ' OR LOWER(alias) = LOWER(:alias)';
            $params['alias'] = $alias;
        }

        $statement = $this->connection->prepare($sql);
        $statement->execute($params);

        return (bool) $statement->fetchColumn();
    }

    public function findAll(): array
    {
        $sql = 'SELECT id, user_id, nome_artista, alias, categoria, provincia, instagram_facebook, spotify, soundcloud, commento, status, created_at
                FROM suggestions
                ORDER BY created_at DESC';

        $statement = $this->connection->query($sql);
        $suggestions = $statement->fetchAll(PDO::FETCH_ASSOC);

        foreach ($suggestions as &$suggestion) {
            foreach ($suggestion as $key => $value) {
                $suggestion[$key] = $value === null ? null : htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }
        }

        return $suggestions;
    }

    public function findById(int $id): ?array
    {
        $sql = 'SELECT id, user_id, nome_artista, alias, categoria, provincia, instagram_facebook, spotify, soundcloud, commento, status
                FROM suggestions
                WHERE id = :id';

        $statement = $this->connection->prepare($sql);
        $statement->execute(['id' => $id]);

        $suggestion = $statement->fetch(PDO::FETCH_ASSOC);

        return $suggestion ?: null;
    }

    public function markAsProcessed(int $id, string $status = 'processed'): void
    {
        $sql = 'UPDATE suggestions SET status = :status WHERE id = :id';
        $statement = $this->connection->prepare($sql);
        $statement->execute([
            'status' => $status,
            'id' => $id,
        ]);
    }
}
