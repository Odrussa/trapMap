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

$hasArtistCard = false;

try {
    $artistCardRepository = new ArtistCardRequestRepository($database);
    $hasArtistCard = $artistCardRepository->userHasCard((int) $session->get('user_id'));
} catch (Throwable $exception) {
    error_log('User info artist card lookup failed: ' . $exception->getMessage());
}

echo json_encode([
    'logged_in' => true,
    'username' => $username,
    'has_artist_card' => $hasArtistCard,
]);
