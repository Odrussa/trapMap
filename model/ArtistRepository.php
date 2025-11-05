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
        $baseQuery = <<<SQL
            SELECT
                a.id,
                a.nome_artista AS nome,
                a.alias,
                a.provincia,
                a.regione,
                a.spotify,
                a.instagram,
                a.soundcloud,
                a.foto AS immagine,
                GROUP_CONCAT(DISTINCT COALESCE(c.name, c.nome) ORDER BY COALESCE(c.name, c.nome) SEPARATOR ',') AS categorie
            FROM artists_card AS a
            LEFT JOIN artist_categories AS ac ON ac.artist_id = a.id
            LEFT JOIN categories AS c ON c.id = ac.category_id
        SQL;

        $parameters = [];

        if ($province) {
            $baseQuery .= ' WHERE a.provincia = :provincia';
            $parameters['provincia'] = $province;
        }

        $baseQuery .= ' GROUP BY a.id, a.nome_artista, a.alias, a.provincia, a.regione, a.spotify, a.instagram, a.soundcloud, a.foto';

        $statement = $this->connection->prepare($baseQuery);
        $statement->execute($parameters);
        $artists = $statement->fetchAll();

        foreach ($artists as &$artist) {
            $rawCategories = $artist['categorie'] ?? null;

            foreach ($artist as $key => $value) {
                if ($key === 'categorie') {
                    continue;
                }

                if (is_string($value)) {
                    $artist[$key] = htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
                } elseif ($value === null) {
                    $artist[$key] = null;
                }
            }

            if ($rawCategories === null || $rawCategories === '') {
                $artist['categorie'] = [];
                continue;
            }

            $categoryList = array_filter(array_map('trim', explode(',', $rawCategories)));
            $artist['categorie'] = array_map(
                static fn(string $category): string => htmlspecialchars($category, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'),
                $categoryList
            );
        }

        return $artists;
    }
}
