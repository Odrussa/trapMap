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

// ---------------------------------------------------
// 1. Validazione dei dati di input
// ---------------------------------------------------

$input = [
    'nome_artista' => trim($_POST['artist_name'] ?? ''),
    'alias'        => trim($_POST['artist_alias'] ?? ''),
    'provincia'    => trim($_POST['province'] ?? ''),
    'categoria'    => trim($_POST['category'] ?? ''), // ID categoria
    'instagram'    => trim($_POST['instagram'] ?? ''),
    'spotify'      => trim($_POST['spotify'] ?? ''),
    'soundcloud'   => trim($_POST['soundcloud'] ?? '')
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

// ---------------------------------------------------
// 2. Gestione immagine upload
// ---------------------------------------------------

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

// ---------------------------------------------------
// 3. Controllo MIME type
// ---------------------------------------------------

$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($uploadedImage['tmp_name']);
$allowedMimeTypes = [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif'
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

// ---------------------------------------------------
// 4. Verifica se l'utente è già artista
// ---------------------------------------------------

$database   = Database::getInstance()->getConnection();
$repository = new ArtistCardRequestRepository($database);

try {
    if ($repository->userHasCard((int) $userId)) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'message' => 'Sei già artista, non puoi inviare una nuova artist card.'
        ]);
        exit;
    }
} catch (Throwable $exception) {

    if (is_file($destinationPath)) unlink($destinationPath);

    error_log('Artist card lookup error: ' . $exception->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Errore durante la verifica del tuo stato artista.']
    ]);
    exit;
}

// ---------------------------------------------------
// 5. Creazione della card
// ---------------------------------------------------

try {
    $cardId = $repository->create([
        'id_artist'    => $userId,
        'nome_artista' => $input['nome_artista'],
        'alias'        => $input['alias'],
        'provincia'    => $input['provincia'],
        'instagram'    => $input['instagram'],
        'spotify'      => $input['spotify'],
        'soundcloud'   => $input['soundcloud'],
        'foto'         => $imageRelativePath,
        'stato'        => 'pending'
    ]);
} catch (Throwable $exception) {

    if (is_file($destinationPath)) unlink($destinationPath);

    error_log('Artist card creation error: ' . $exception->getMessage());

    http_response_code(500);
    echo json_encode([
        'success' => false,
        'errors' => ['Errore durante il salvataggio della tua artist card.']
    ]);
    exit;
}

// ---------------------------------------------------
// 6. Salvataggio categoria nella pivot 
// ---------------------------------------------------

try {
    if (!empty($input['categoria'])) {

        $stmt = $database->prepare(
            'INSERT INTO artist_categories (artist_id, category_id)
             VALUES (:artist_id, :category_id)'
        );

        $stmt->execute([
            'artist_id'   => $cardId, // ID della card appena creata
            'category_id' => (int) $input['categoria']
        ]);
    }
} catch (Throwable $exception) {

    error_log('Artist category save error: ' . $exception->getMessage());

    // la card rimane salvata, ma categoria fallisce
    // decidi tu se rollbackare o meno
}

// ---------------------------------------------------
// 7. Risposta OK
// ---------------------------------------------------

echo json_encode([
    'success'        => true,
    'message'        => 'La tua artist card è stata creata! Il team la esaminerà a breve.',
    'artist_card_id' => $cardId,
    'image_path'     => $imageRelativePath
]);
