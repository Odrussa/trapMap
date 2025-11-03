<?php
require 'db.php';
require 'session.php';

header('Content-Type: application/json');

$response = ['success' => false, 'errors' => []];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    // Controllo campi vuoti
    if ($username === '' || $password === '') {
        $response['errors'][] = "Tutti i campi sono obbligatori.";
        echo json_encode($response);
        exit();
    }

    // Query con PDO
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE username = :username");
    $stmt->execute(['username' => $username]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        // Rigenera l'ID di sessione per prevenire session fixation.
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];

        // Aggiorna last_login
        $update = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE id = :id");
        $update->execute(['id' => $user['id']]);

        $response['success'] = true;
        $response['message'] = "Accesso effettuato con successo!";
    } else {
        $response['errors'][] = "Credenziali non valide.";
    }

    echo json_encode($response);
}
?>
