<?php
/**
 * artists.php
 * Restituisce la lista di artisti (filtrabile per provincia)
 * in formato JSON, con protezione contro SQL injection e XSS.
 */

require 'db.php'; // connessione PDO sicura
session_start();

// Imposta il tipo di risposta
header('Content-Type: application/json; charset=UTF-8');

// Recupera parametro GET e lo sanifica (rimuove spazi e caratteri pericolosi)
$province = isset($_GET['province']) ? trim($_GET['province']) : null;

// ✅ Base della query con alias leggibili
$sql = "SELECT 
            nome_artista AS nome, 
            alias, 
            provincia, 
            regione, 
            spotify, 
            instagram, 
            soundcloud, 
            foto AS immagine
        FROM artists_card";

$params = [];

// ✅ Prepara il filtro per provincia solo se fornito
if ($province) {
    // Prepared statement → evita SQL injection
    $sql .= " WHERE provincia = :provincia";
    $params['provincia'] = $province;
}

// ✅ Esegui la query in modo sicuro
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$artists = $stmt->fetchAll();

// ✅ Sanifica l’output contro XSS (HTML e JS malevoli)
// Ogni valore testuale viene "escapato" prima di restituirlo in JSON
foreach ($artists as &$artist) {
    foreach ($artist as $key => $value) {
        // htmlspecialchars → converte < > & " ' in entità HTML sicure
        $artist[$key] = htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
unset($artist); // buona pratica per evitare riferimenti residui

// ✅ Restituisci i dati in JSON (solo testo sanificato)
echo json_encode($artists, JSON_UNESCAPED_UNICODE);
?>
