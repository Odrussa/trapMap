<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json');

$session = SessionManager::getInstance();

if (!$session->has('user_id')) {
    echo json_encode(['logged_in' => false]);
    exit;
}

$database = Database::getInstance()->getConnection();
$userRepository = new UserRepository($database);
$username = $userRepository->findUsernameById((int)$session->get('user_id'));

if ($username === null) {
    echo json_encode(['logged_in' => false]);
    exit;
}

echo json_encode([
    'logged_in' => true,
    'username' => $username,
]);
