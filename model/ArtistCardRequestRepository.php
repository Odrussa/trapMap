<?php
/**
 * Gestisce la creazione delle richieste di artist card.
 */
class ArtistCardRequestRepository
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function create(array $data): int
    {
        $statement = $this->connection->prepare(
            'INSERT INTO artists_cards (
                user_id,
                nome_artista,
                alias,
                provincia,
                categoria,
                instagram,
                spotify,
                soundcloud,
                image_path,
                stato
            ) VALUES (
                :user_id,
                :nome_artista,
                :alias,
                :provincia,
                :categoria,
                :instagram,
                :spotify,
                :soundcloud,
                :image_path,
                :stato
            )'
        );

        $statement->execute([
            'user_id' => $data['user_id'],
            'nome_artista' => $data['nome_artista'],
            'alias' => $data['alias'] !== '' ? $data['alias'] : null,
            'provincia' => $data['provincia'],
            'categoria' => $data['categoria'],
            'instagram' => $data['instagram'],
            'spotify' => $data['spotify'] !== '' ? $data['spotify'] : null,
            'soundcloud' => $data['soundcloud'] !== '' ? $data['soundcloud'] : null,
            'image_path' => $data['image_path'],
            'stato' => $data['stato'] ?? 'pending',
        ]);

        return (int) $this->connection->lastInsertId();
    }

    public function userHasCard(int $userId): bool
    {
        $statement = $this->connection->prepare(
            'SELECT COUNT(*) FROM artists_cards WHERE user_id = :user_id'
        );
        $statement->execute(['user_id' => $userId]);

        return (bool) $statement->fetchColumn();
    }
}
