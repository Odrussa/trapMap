<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'errors' => ['Metodo non consentito.']
    ]);
    exit;
}

$session = SessionManager::getInstance();
$userId = $session->get('user_id');

if ($userId === null) {
    http_response_code(403);
    echo json_encode([
        'success' => false,
        'errors' => ['Devi effettuare il login per creare la tua artist card.']
    ]);
    exit;
}

$input = [
    'nome_artista' => trim($_POST['artist_name'] ?? ''),
    'alias' => trim($_POST['artist_alias'] ?? ''),
    'provincia' => trim($_POST['province'] ?? ''),
    'categoria' => trim($_POST['category'] ?? ''),
    'instagram' => trim($_POST['instagram'] ?? ''),
    'spotify' => trim($_POST['spotify'] ?? ''),
    'soundcloud' => trim($_POST['soundcloud'] ?? '')
];

$errors = [];

if ($input['nome_artista'] === '') {
    $errors[] = "Il nome dell'artista è obbligatorio.";
}

if ($input['provincia'] === '') {
    $errors[] = 'Seleziona una provincia.';
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

$uploadedImage = $_FILES['image'] ?? null;

if (!$uploadedImage || $uploadedImage['error'] === UPLOAD_ERR_NO_FILE) {
    $errors[] = 'Carica un\'immagine per la tua artist card.';
} elseif ($uploadedImage['error'] !== UPLOAD_ERR_OK) {
    $errors[] = 'Errore durante il caricamento dell\'immagine. Riprova.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'errors' => $errors
    ]);
    exit;
}

$database = Database::getInstance()->getConnection();
$repository = new ArtistCardRequestRepository($database);

try {
    if ($repository->userHasCard((int) $userId)) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Hai già inviato una artist card.'
        ]);
        exit;
    }
} catch (Throwable $exception) {
    error_log('Artist card lookup error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Errore durante la verifica delle artist card esistenti.']
    ]);
    exit;
}

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($uploadedImage['tmp_name']);
$allowedMimeTypes = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    'image/gif' => 'gif'
];

if (!is_string($mimeType) || !isset($allowedMimeTypes[$mimeType])) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'errors' => ['Formato immagine non supportato.']
    ]);
    exit;
}

$uploadDirectory = __DIR__ . '/../view/assets/uploads/artist_cards';

if (!is_dir($uploadDirectory) && !mkdir($uploadDirectory, 0775, true) && !is_dir($uploadDirectory)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Impossibile preparare la cartella di upload.']
    ]);
    exit;
}

try {
    $fileName = bin2hex(random_bytes(16)) . '.' . $allowedMimeTypes[$mimeType];
} catch (Exception $exception) {
    error_log('Random filename generation failed: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Impossibile generare il nome del file.']
    ]);
    exit;
}

$destinationPath = $uploadDirectory . '/' . $fileName;

if (!move_uploaded_file($uploadedImage['tmp_name'], $destinationPath)) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Impossibile salvare l\'immagine caricata.']
    ]);
    exit;
}

$imageRelativePath = 'assets/uploads/artist_cards/' . $fileName;

try {
    $cardId = $repository->create([
        'user_id' => (int) $userId,
        'nome_artista' => $input['nome_artista'],
        'alias' => $input['alias'],
        'provincia' => $input['provincia'],
        'categoria' => $input['categoria'],
        'instagram' => $input['instagram'],
        'spotify' => $input['spotify'],
        'soundcloud' => $input['soundcloud'],
        'image_path' => $imageRelativePath,
        'stato' => 'pending'
    ]);
} catch (Throwable $exception) {
    if (is_file($destinationPath)) {
        unlink($destinationPath);
    }

    error_log('Artist card creation error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Errore durante il salvataggio della tua artist card.']
    ]);
    exit;
}

$message = 'La tua artist card è stata creata! Il team la esaminerà a breve.';

echo json_encode([
    'success' => true,
    'message' => $message,
    'artist_card_id' => $cardId,
    'image_path' => $imageRelativePath
]);
