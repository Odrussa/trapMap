<?php
/**
 * Singleton responsabile della connessione al database tramite PDO.
 */
class Database
{
    private static ?Database $instance = null;
    private \PDO $connection;

    private function __construct()
    {
		// Recupera variabili d’ambiente (configurate in .env o nel sistema)
		putenv('DB_HOST=localhost');
		putenv('DB_NAME=trapmap');
		putenv('DB_USER=root');
		putenv('DB_PASS=Ninodollaro$04');

        $host = getenv('DB_HOST') ?: 'localhost';
        $dbName = getenv('DB_NAME') ?: 'trapmap';
        $user = getenv('DB_USER') ?: 'root';
        $password = getenv('DB_PASS') ?: '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host={$host};dbname={$dbName};charset={$charset}";
        $options = [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC,
            \PDO::ATTR_EMULATE_PREPARES => false,
        ];

        try {
            $this->connection = new \PDO($dsn, $user, $password, $options);
        } catch (\PDOException $exception) {
            error_log('DB connection failed: ' . $exception->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Errore di connessione al database.']);
            exit;
        }
    }

    public static function getInstance(): Database
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function getConnection(): \PDO
    {
        return $this->connection;
    }
}
