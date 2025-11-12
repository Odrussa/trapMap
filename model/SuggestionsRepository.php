<?php
/**
 * Incapsula tutte le operazioni relative ai suggerimenti.
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
        $stmt = $this->connection->prepare(
            'INSERT INTO suggestions (nome_artista, alias, provincia, instagram, spotify, soundcloud, categoria)
             VALUES (:nome_artista, :alias, :provincia, :instagram, :spotify, :soundcloud, :categoria)'
        );

        $stmt->execute([
            'nome_artista' => $data['nome_artista'],
            'alias' => $data['alias'] !== '' ? $data['alias'] : null,
            'provincia' => $data['provincia'] !== '' ? $data['provincia'] : null,
            'instagram' => $data['instagram'],
            'spotify' => $data['spotify'] !== '' ? $data['spotify'] : null,
            'soundcloud' => $data['soundcloud'] !== '' ? $data['soundcloud'] : null,
            'categoria' => $data['categoria'],
        ]);

        return (int) $this->connection->lastInsertId();
    }
}
