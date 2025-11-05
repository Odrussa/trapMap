<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Metodo non consentito.']]);
    exit;
}

$session = SessionManager::getInstance();
$database = Database::getInstance()->getConnection();
$suggestionRepository = new SuggestionRepository($database);
$artistRepository = new ArtistRepository($database);

$payload = [
    'nome_artista' => trim($_POST['artist_name'] ?? ''),
    'alias' => trim($_POST['alias'] ?? ''),
    'categoria' => trim($_POST['category'] ?? ''),
    'provincia' => trim($_POST['province'] ?? ''),
    'instagram_facebook' => trim($_POST['instagram_facebook'] ?? ''),
    'spotify' => trim($_POST['spotify'] ?? ''),
    'soundcloud' => trim($_POST['soundcloud'] ?? ''),
    'commento' => trim($_POST['comment'] ?? ''),
];

$errors = [];

if ($payload['nome_artista'] === '') {
    $errors[] = 'Il nome dell\'artista è obbligatorio.';
}

if ($payload['categoria'] === '') {
    $errors[] = 'La categoria è obbligatoria.';
}

if ($payload['instagram_facebook'] === '') {
    $errors[] = 'Inserisci un contatto Instagram o Facebook.';
}

if ($payload['spotify'] !== '' && !filter_var($payload['spotify'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Spotify non è valido.';
}

if ($payload['soundcloud'] !== '' && !filter_var($payload['soundcloud'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link SoundCloud non è valido.';
}

if (!filter_var($payload['instagram_facebook'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Instagram/Facebook non è valido.';
}

$alias = $payload['alias'] !== '' ? ltrim($payload['alias'], '@') : null;

if ($artistRepository->existsByNameOrAlias($payload['nome_artista'], $alias)) {
    $errors[] = 'Esiste già una scheda artista con lo stesso nome o alias.';
}

if ($suggestionRepository->existsDuplicate($payload['nome_artista'], $alias)) {
    $errors[] = 'Esiste già un suggerimento con lo stesso nome o alias.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

try {
    $suggestionRepository->create([
        'user_id' => $session->has('user_id') ? (int)$session->get('user_id') : null,
        'nome_artista' => $payload['nome_artista'],
        'alias' => $alias,
        'categoria' => $payload['categoria'],
        'provincia' => $payload['provincia'] !== '' ? $payload['provincia'] : null,
        'instagram_facebook' => $payload['instagram_facebook'],
        'spotify' => $payload['spotify'] !== '' ? $payload['spotify'] : null,
        'soundcloud' => $payload['soundcloud'] !== '' ? $payload['soundcloud'] : null,
        'commento' => $payload['commento'],
        'status' => 'pending',
    ]);
} catch (Throwable $exception) {
    error_log('SuggestionsController error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'errors' => ['Errore durante il salvataggio del suggerimento.']]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Suggerimento inviato con successo.']);
