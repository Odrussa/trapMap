<?php
/**
 * Incapsula tutte le operazioni relative agli utenti.
 */
class UserRepository
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function findByUsername(string $username): ?array
    {
        $stmt = $this->connection->prepare('SELECT id, username, password, email FROM users WHERE username = :username LIMIT 1');
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function findUsernameById(int $id): ?string
    {
        $stmt = $this->connection->prepare('SELECT username FROM users WHERE id = :id LIMIT 1');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();

        return $result['username'] ?? null;
    }

    public function existsByEmailOrUsername(string $email, string $username): bool
    {
        $stmt = $this->connection->prepare('SELECT COUNT(*) FROM users WHERE email = :email OR username = :username');
        $stmt->execute(['email' => $email, 'username' => $username]);

        return (bool)$stmt->fetchColumn();
    }

    public function create(array $data): int
    {
        $stmt = $this->connection->prepare(
            'INSERT INTO users (nome, cognome, username, email, password) VALUES (:nome, :cognome, :username, :email, :password)'
        );

        $stmt->execute([
            'nome' => htmlspecialchars($data['nome'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            'cognome' => htmlspecialchars($data['cognome'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            'username' => htmlspecialchars($data['username'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            'email' => $data['email'],
            'password' => $data['password'],
        ]);

        return (int)$this->connection->lastInsertId();
    }
}
