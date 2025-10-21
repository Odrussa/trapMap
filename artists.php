<?php
// Connessione al DB
$host = 'localhost';
$db   = 'trapmap';
$user = 'root';
$pass = 'Ninodollaro$04';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}

// Recupera parametri (opzionale)
$province = isset($_GET['province']) ? $_GET['province'] : null;

// Query
$sql = "SELECT nome_artista AS nome, alias, provincia, regione, spotify, instagram, soundcloud, foto AS immagine
        FROM artists_card";

$params = [];
if ($province) {
    $sql .= " WHERE provincia = :provincia";
    $params['provincia'] = $province;
}

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$artists = $stmt->fetchAll();

header('Content-Type: application/json');
echo json_encode($artists);
?>
