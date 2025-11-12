<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Metodo non consentito.']]);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'errors' => ['Formato del payload non valido.']]);
    exit;
}

$input = [
    'nome_artista' => trim($payload['nome_artista'] ?? ''),
    'alias' => trim($payload['alias'] ?? ''),
    'provincia' => trim($payload['provincia'] ?? ''),
    'instagram' => trim($payload['instagram'] ?? ''),
    'spotify' => trim($payload['spotify'] ?? ''),
    'soundcloud' => trim($payload['soundcloud'] ?? ''),
    'categoria' => trim($payload['categoria'] ?? ''),
];

$errors = [];

if ($input['nome_artista'] === '') {
    $errors[] = 'Il nome dell\'artista è obbligatorio.';
}

if ($input['categoria'] === '') {
    $errors[] = 'Seleziona una categoria.';
}

if ($input['instagram'] === '') {
    $errors[] = 'Il link Instagram è obbligatorio.';
} elseif (!filter_var($input['instagram'], FILTER_VALIDATE_URL)) {
    $errors[] = 'Il link Instagram non è valido.';
}

foreach (['spotify' => 'Spotify', 'soundcloud' => 'SoundCloud'] as $field => $label) {
    if ($input[$field] !== '' && !filter_var($input[$field], FILTER_VALIDATE_URL)) {
        $errors[] = "Il link {$label} non è valido.";
    }
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$database = Database::getInstance()->getConnection();
$suggestionRepository = new SuggestionRepository($database);

try {
    $suggestionId = $suggestionRepository->create($input);
} catch (Throwable $exception) {
    error_log('Suggestion creation error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'errors' => ['Errore durante il salvataggio del suggerimento.']]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Suggerimento inviato con successo.',
    'suggestion_id' => $suggestionId,
]);
