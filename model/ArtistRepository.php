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

    public function findByProvince(?string $province = null): array
    {
        $baseQuery = 'SELECT nome_artista AS nome, alias, provincia, regione, spotify, instagram, soundcloud, foto AS immagine FROM artists_card';
        $parameters = [];

        if ($province) {
            $baseQuery .= ' WHERE provincia = :provincia';
            $parameters['provincia'] = $province;
        }

        $statement = $this->connection->prepare($baseQuery);
        $statement->execute($parameters);
        $artists = $statement->fetchAll();

        foreach ($artists as &$artist) {
            foreach ($artist as $key => $value) {
                $artist[$key] = htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            }
        }

        return $artists;
    }
}
