<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Metodo non consentito.']);
    exit;
}

SessionManager::getInstance()->destroy();

echo json_encode(['success' => true]);
