<?php
// Connessione al DB con credenziali lette da variabili d'ambiente per evitare di esporre segreti nel codice sorgente.
$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'trapmap';
$user = getenv('DB_USER') ?: 'trapmap_user';
$pass = getenv('DB_PASS');
$charset = 'utf8mb4';

if ($pass === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Database configuration missing.']);
    exit;
}

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection error.']);
    exit;
}
