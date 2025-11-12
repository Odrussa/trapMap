<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

$province = isset($_GET['province']) ? trim($_GET['province']) : null;

$database = Database::getInstance()->getConnection();
$repository = new ArtistRepository($database);

try {
    $artists = $repository->findByProvince($province ?: null);
    echo json_encode($artists, JSON_UNESCAPED_UNICODE);
} catch (Throwable $exception) {
    error_log('ArtistsController error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Errore nel recupero degli artisti.']);
}
