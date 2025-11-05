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
$artistRepository = new ArtistRepository($database);
$categoryRepository = new CategoryRepository($database);
$userRepository = new UserRepository($database);

$userId = (int)$session->get('user_id');
$existingCard = $artistRepository->findByUserId($userId);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $card = $artistRepository->findWithCategoriesByUserId($userId);

    if (!$card) {
        echo json_encode(['success' => false, 'errors' => ['Nessuna artist card trovata.']]);
        exit;
    }

    $categorySlug = null;
    if (!empty($card['categorie'])) {
        $parts = explode(',', $card['categorie']);
        $categorySlug = trim((string)$parts[0]);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'nome_artista' => $card['nome_artista'],
            'alias' => $card['alias'],
            'provincia' => $card['provincia'],
            'regione' => $card['regione'],
            'categoria' => $categorySlug,
            'spotify' => $card['spotify'],
            'instagram' => $card['instagram'],
            'soundcloud' => $card['soundcloud'],
            'stato' => $card['stato'],
        ],
    ]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Metodo non consentito.']]);
    exit;
}

$payload = [
    'nome_artista' => trim($_POST['artist_name'] ?? ''),
    'alias' => trim($_POST['artist_alias'] ?? ''),
    'provincia' => trim($_POST['province'] ?? ''),
    'regione' => trim($_POST['region'] ?? ''),
    'categoria' => trim($_POST['category'] ?? ''),
    'spotify' => trim($_POST['spotify'] ?? ''),
    'instagram' => trim($_POST['instagram'] ?? ''),
    'soundcloud' => trim($_POST['soundcloud'] ?? ''),
];

$errors = [];

foreach (['nome_artista', 'alias', 'provincia', 'regione', 'categoria'] as $field) {
    if ($payload[$field] === '') {
        $errors[] = 'Il campo ' . str_replace('_', ' ', $field) . ' è obbligatorio.';
    }
}

if ($payload['instagram'] === '') {
    $errors[] = 'Il link Instagram/Facebook è obbligatorio.';
}

if ($payload['spotify'] !== '' && !filter_var($payload['spotify'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Spotify non è valido.';
}

if ($payload['instagram'] !== '' && !filter_var($payload['instagram'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Instagram non è valido.';
}

if ($payload['soundcloud'] !== '' && !filter_var($payload['soundcloud'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link SoundCloud non è valido.';
}

$alias = $payload['alias'] !== '' ? ltrim($payload['alias'], '@') : null;

$existingId = $existingCard['id'] ?? null;

if ($artistRepository->existsByNameOrAlias($payload['nome_artista'], $alias, $existingId ? (int)$existingId : null)) {
    $errors[] = 'Esiste già una scheda con questo nome o alias.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$categoryId = $categoryRepository->findIdByIdentifier($payload['categoria']);

if ($categoryId === null) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => ['Categoria non riconosciuta.']]);
    exit;
}

$data = [
    'user_id' => $userId,
    'nome_artista' => $payload['nome_artista'],
    'alias' => $alias,
    'provincia' => $payload['provincia'],
    'regione' => $payload['regione'],
    'spotify' => $payload['spotify'] !== '' ? $payload['spotify'] : null,
    'instagram' => $payload['instagram'],
    'soundcloud' => $payload['soundcloud'] !== '' ? $payload['soundcloud'] : null,
];

try {
    $database->beginTransaction();

    if ($existingCard) {
        $artistRepository->update((int)$existingCard['id'], $data + ['stato' => $existingCard['stato']], [$categoryId]);
    } else {
        $artistId = $artistRepository->create($data + ['stato' => 'pending'], [$categoryId]);
        $existingId = $artistId;
    }

    $userRepository->setArtistFlag($userId, true);

    if ($database->inTransaction()) {
        $database->commit();
    }
} catch (Throwable $exception) {
    if ($database->inTransaction()) {
        $database->rollBack();
    }
    error_log('ArtistCardController error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'errors' => ['Errore durante il salvataggio della card.']]);
    exit;
}

$response = [
    'success' => true,
    'message' => $existingCard ? 'La tua scheda è stata aggiornata con successo.' : 'La tua scheda è stata inviata e verrà valutata dallo staff entro poche ore.',
    'artist_id' => $existingCard['id'] ?? $existingId ?? null,
    'status' => $existingCard['stato'] ?? 'pending',
];

echo json_encode($response);
