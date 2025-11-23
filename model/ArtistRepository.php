<?php
/**
 * Gestisce il recupero dei dati relativi agli artisti.
 */
class ArtistRepository
{
    private \PDO $connection;

    public function __construct(\PDO $connection)
    {
        $this->connection = $connection;
    }

    public function findByRegion(?string $region = null): array
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

        if ($region) {
            $baseQuery .= ' WHERE a.regione = :regione';
            $parameters['regione'] = $region;
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
}
