<?php

class ArtistCardRequestRepository
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    /**
     * Crea una nuova artist card (in stato pending).
     * id_artist è NULL perché l'utente non è ancora artista.
     */
    public function create(array $data): int
    {
        $statement = $this->connection->prepare(
            'INSERT INTO artists_card (
                id_artist,
                nome_artista,
                alias,
                provincia,
                spotify,
                instagram,
                soundcloud,
                foto,
                stato
            ) VALUES (
                :id_artist,
                :nome_artista,
                :alias,
                :provincia,
                :spotify,
                :instagram,
                :soundcloud,
                :foto,
                :stato
            )'
        );

        $statement->execute([
            'id_artist'    => $data['id_artist'],  // può essere null
            'nome_artista' => $data['nome_artista'],
            'alias'        => $data['alias'] !== '' ? $data['alias'] : null,
            'provincia'    => $data['provincia'],
            'spotify'      => $data['spotify'] !== '' ? $data['spotify'] : null,
            'instagram'    => $data['instagram'],
            'soundcloud'   => $data['soundcloud'] !== '' ? $data['soundcloud'] : null,
            'foto'         => $data['foto'],
            'stato'        => $data['stato'] ?? 'pending',
        ]);

        return (int) $this->connection->lastInsertId();
    }

    /**
     * Verifica se l'utente è già artista.
     * Se è già nella tabella artists, non può più inviare richieste.
     */
    public function userHasCard(int $userId): bool
    {
        $statement = $this->connection->prepare(
            'SELECT COUNT(*)
             FROM artists_card
             WHERE id_artist = :id_user'
        );

        $statement->execute(['id_user' => $userId]);

        return (bool) $statement->fetchColumn();
    }
}
