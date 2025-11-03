<?php
/**
 * db.php — Connessione sicura al database tramite variabili d’ambiente
 */

// Recupera variabili d’ambiente (configurate in .env o nel sistema)
putenv('DB_HOST=localhost');
putenv('DB_NAME=trapmap');
putenv('DB_USER=root');
putenv('DB_PASS=Ninodollaro$04');

$host = getenv('DB_HOST') ?: 'localhost';
$db   = getenv('DB_NAME') ?: 'trapmap';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = 'utf8mb4';

// Configurazione PDO
$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false, // protegge da SQL injection
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    // Maschera l’errore per non esporre credenziali o stack trace
    error_log("DB connection failed: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Errore di connessione al database.']);
    exit;
}
?>
