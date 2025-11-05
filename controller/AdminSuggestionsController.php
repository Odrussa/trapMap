<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json; charset=UTF-8');

$session = SessionManager::getInstance();

if (!$session->has('user_id')) {
    http_response_code(401);
    echo json_encode(['success' => false, 'errors' => ['Autenticazione richiesta.']]);
    exit;
}

$database = Database::getInstance()->getConnection();
$userRepository = new UserRepository($database);

$userId = (int)$session->get('user_id');

if (!$userRepository->isAdmin($userId)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'errors' => ['Accesso negato.']]);
    exit;
}

$suggestionRepository = new SuggestionRepository($database);
$artistRepository = new ArtistRepository($database);
$categoryRepository = new CategoryRepository($database);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $suggestions = $suggestionRepository->findAll();
        echo json_encode(['success' => true, 'data' => $suggestions]);
        exit;
    } catch (Throwable $exception) {
        error_log('AdminSuggestionsController GET error: ' . $exception->getMessage());
        http_response_code(500);
        echo json_encode(['success' => false, 'errors' => ['Impossibile recuperare i suggerimenti.']]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Metodo non consentito.']]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => ['Payload non valido.']]);
    exit;
}

$suggestionId = isset($input['suggestion_id']) ? (int)$input['suggestion_id'] : 0;

if ($suggestionId <= 0) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => ['Suggerimento non specificato.']]);
    exit;
}

$suggestion = $suggestionRepository->findById($suggestionId);

if (!$suggestion) {
    http_response_code(404);
    echo json_encode(['success' => false, 'errors' => ['Suggerimento non trovato.']]);
    exit;
}

$payload = [
    'nome_artista' => trim($input['nome_artista'] ?? $suggestion['nome_artista'] ?? ''),
    'alias' => trim($input['alias'] ?? (string)($suggestion['alias'] ?? '')),
    'provincia' => trim($input['provincia'] ?? (string)($suggestion['provincia'] ?? '')),
    'categoria' => trim($input['categoria'] ?? (string)($suggestion['categoria'] ?? '')),
    'instagram_facebook' => trim($input['instagram_facebook'] ?? (string)($suggestion['instagram_facebook'] ?? '')),
    'spotify' => trim($input['spotify'] ?? (string)($suggestion['spotify'] ?? '')),
    'soundcloud' => trim($input['soundcloud'] ?? (string)($suggestion['soundcloud'] ?? '')),
    'user_id' => $suggestion['user_id'] ? (int)$suggestion['user_id'] : null,
];

$errors = [];

if ($payload['nome_artista'] === '') {
    $errors[] = 'Il nome artista è obbligatorio.';
}

if ($payload['categoria'] === '') {
    $errors[] = 'La categoria è obbligatoria.';
}

if ($payload['instagram_facebook'] === '') {
    $errors[] = 'Il contatto Instagram/Facebook è obbligatorio.';
}

if (!filter_var($payload['instagram_facebook'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Instagram/Facebook non è valido.';
}

if ($payload['spotify'] !== '' && !filter_var($payload['spotify'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Spotify non è valido.';
}

if ($payload['soundcloud'] !== '' && !filter_var($payload['soundcloud'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link SoundCloud non è valido.';
}

$alias = $payload['alias'] !== '' ? ltrim($payload['alias'], '@') : null;

if ($artistRepository->existsByNameOrAlias($payload['nome_artista'], $alias)) {
    $errors[] = 'Esiste già una scheda artista con questo nome o alias.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$categoryId = $categoryRepository->findIdByIdentifier($payload['categoria']);

if ($categoryId === null) {
    $errors[] = 'Categoria non riconosciuta.';
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

try {
    $database->beginTransaction();

    $artistId = $artistRepository->create([
        'user_id' => $payload['user_id'],
        'nome_artista' => $payload['nome_artista'],
        'alias' => $alias,
        'provincia' => $payload['provincia'] !== '' ? $payload['provincia'] : null,
        'regione' => null,
        'spotify' => $payload['spotify'] !== '' ? $payload['spotify'] : null,
        'instagram' => $payload['instagram_facebook'],
        'soundcloud' => $payload['soundcloud'] !== '' ? $payload['soundcloud'] : null,
        'stato' => 'verified',
    ], [$categoryId]);

    $suggestionRepository->markAsProcessed($suggestionId, 'converted');

    if ($payload['user_id']) {
        $userRepository->setArtistFlag($payload['user_id'], true);
    }
    $database->commit();
} catch (Throwable $exception) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    error_log('AdminSuggestionsController POST error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'errors' => ['Errore durante la creazione della card.']]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Artist card creata con successo.', 'artist_id' => $artistId]);
