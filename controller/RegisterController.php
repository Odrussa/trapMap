<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Metodo non consentito.']]);
    exit;
}

$input = [
    'nome' => trim($_POST['nome'] ?? ''),
    'cognome' => trim($_POST['cognome'] ?? ''),
    'username' => trim($_POST['username'] ?? ''),
    'email' => trim($_POST['email'] ?? ''),
    'password' => $_POST['password'] ?? '',
    'confirm_password' => $_POST['confirm_password'] ?? '',
];

$errors = [];

foreach (['nome', 'cognome', 'username', 'email', 'password', 'confirm_password'] as $field) {
    if ($input[$field] === '') {
        $errors[] = 'Tutti i campi sono obbligatori.';
        break;
    }
}

if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Email non valida.';
}

if (strlen($input['password']) < 8) {
    $errors[] = 'La password deve contenere almeno 8 caratteri.';
}

if ($input['password'] !== $input['confirm_password']) {
    $errors[] = 'Le password non corrispondono.';
}

$database = Database::getInstance()->getConnection();
$userRepository = new UserRepository($database);

if ($userRepository->existsByEmailOrUsername($input['email'], $input['username'])) {
    $errors[] = 'Email o username già registrati.';
}

if ($errors) {
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

$hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);

try {
    $userId = $userRepository->create([
        'nome' => $input['nome'],
        'cognome' => $input['cognome'],
        'username' => $input['username'],
        'email' => $input['email'],
        'password' => $hashedPassword,
    ]);
} catch (Throwable $exception) {
    error_log('Registration error: ' . $exception->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'errors' => ['Errore durante la registrazione.']]);
    exit;
}

$session = SessionManager::getInstance();
$session->set('user_id', $userId);
$session->regenerate();

$subject = AuthSubject::getInstance();
$subject->notify('registration', [
    'user_id' => $userId,
    'username' => $input['username'],
    'email' => $input['email'],
]);

echo json_encode(['success' => true, 'message' => 'Registrazione completata!']);
