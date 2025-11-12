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
            'INSERT INTO suggestions (nome_artista, alias, provincia, instagram, spotify, soundcloud, categoria) VALUES (:nome_artista, :alias, :provincia, 
			:instagram, :spotify, :soundcloud, :categoria)'
        );

        $stmt->execute([
            'nome_artista' => htmlspecialchars($data['nome_artista'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            'alias' => htmlspecialchars($data['alias'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            'provincia' => htmlspecialchars($data['provincia'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
            'instagram' => $data['instagram'],
            'spotify' => $data['spotify'],
			'soundcloud' => $data['soundcloud'],
			'categoria' => htmlspecialchars($data['categoria'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
        ]);

        return (int)$this->connection->lastInsertId();
    }
}
