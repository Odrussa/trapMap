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

    public function isArtist(int $id): bool
    {
        try {
            $stmt = $this->connection->prepare('SELECT is_artist FROM users WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $id]);
            $value = $stmt->fetchColumn();

            if ($value === false) {
                return false;
            }

            return (bool)$value;
        } catch (PDOException $exception) {
            error_log('UserRepository::isArtist fallback triggered: ' . $exception->getMessage());
        }

        return false;
    }

    public function setArtistFlag(int $id, bool $flag): void
    {
        try {
            $stmt = $this->connection->prepare('UPDATE users SET is_artist = :is_artist WHERE id = :id');
            $stmt->execute([
                'is_artist' => $flag ? 1 : 0,
                'id' => $id,
            ]);
        } catch (PDOException $exception) {
            error_log('UserRepository::setArtistFlag skipped: ' . $exception->getMessage());
        }
    }

    public function isAdmin(int $id): bool
    {
        try {
            $stmt = $this->connection->prepare('SELECT is_admin FROM users WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $id]);
            $value = $stmt->fetchColumn();

            if ($value !== false) {
                return (bool)$value;
            }
        } catch (PDOException $exception) {
            error_log('UserRepository::isAdmin is_admin column missing: ' . $exception->getMessage());
        }

        try {
            $stmt = $this->connection->prepare('SELECT role FROM users WHERE id = :id LIMIT 1');
            $stmt->execute(['id' => $id]);
            $value = $stmt->fetchColumn();

            if ($value !== false) {
                return strtolower((string)$value) === 'admin';
            }
        } catch (PDOException $exception) {
            error_log('UserRepository::isAdmin role column missing: ' . $exception->getMessage());
        }

        return false;
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
