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
$artistRepository = new ArtistRepository($database);
$userId = (int)$session->get('user_id');
$username = $userRepository->findUsernameById($userId);

if ($username === null) {
    echo json_encode(['logged_in' => false]);
    exit;
}

$hasArtistCard = $artistRepository->userHasArtistCard($userId);
$isArtist = $userRepository->isArtist($userId) || $hasArtistCard;

echo json_encode([
    'logged_in' => true,
    'username' => $username,
    'is_artist' => $isArtist,
    'has_artist_card' => $hasArtistCard,
]);
