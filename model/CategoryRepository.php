<?php
/**
 * Repository responsabile delle categorie artista.
 */
class CategoryRepository
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function findIdByIdentifier(string $identifier): ?int
    {
        $normalized = trim($identifier);
        if ($normalized === '') {
            return null;
        }

        $lower = strtolower($normalized);

        $sql = 'SELECT id FROM categories WHERE slug = :identifier OR LOWER(slug) = :lower OR LOWER(name) = :lower LIMIT 1';
        $statement = $this->connection->prepare($sql);
        $statement->execute([
            'identifier' => $normalized,
            'lower' => $lower,
        ]);

        $result = $statement->fetch();

        if ($result && isset($result['id'])) {
            return (int) $result['id'];
        }

        return null;
    }
}
