<?php
require 'session.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['logged_in' => false]);
    exit;
}

require 'db.php';

try {
    $stmt = $pdo->prepare('SELECT username FROM users WHERE id = :id LIMIT 1');
    $stmt->execute(['id' => $_SESSION['user_id']]);
    $user = $stmt->fetch();

    if ($user) {
        echo json_encode([
            'logged_in' => true,
            'username' => $user['username']
        ]);
    } else {
        echo json_encode(['logged_in' => false]);
    }
} catch (PDOException $e) {
    error_log('user_info.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['logged_in' => false, 'error' => 'Errore durante il recupero delle informazioni utente.']);
}