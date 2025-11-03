<?php
// Connessione al DB
require 'db.php'; // connessione al DB
session_start();

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