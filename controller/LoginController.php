<?php
require_once __DIR__ . '/../model/bootstrap.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Metodo non consentito.']]);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = $_POST['password'] ?? '';

if ($username === '' || $password === '') {
    echo json_encode(['success' => false, 'errors' => ['Tutti i campi sono obbligatori.']]);
    exit;
}

$database = Database::getInstance()->getConnection();
$userRepository = new UserRepository($database);
$user = $userRepository->findByUsername($username);

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(['success' => false, 'errors' => ['Credenziali non valide.']]);
    exit;
}

$session = SessionManager::getInstance();
$session->set('user_id', (int)$user['id']);
$session->regenerate();

try {
    $statement = $database->prepare('UPDATE users SET last_login = NOW() WHERE id = :id');
    $statement->execute(['id' => $user['id']]);
} catch (Throwable $exception) {
    error_log('Login update error: ' . $exception->getMessage());
}

AuthSubject::getInstance()->notify('login', [
    'user_id' => (int)$user['id'],
    'username' => $user['username'],
    'email' => $user['email'] ?? null,
]);

echo json_encode(['success' => true, 'message' => 'Accesso effettuato con successo.']);
