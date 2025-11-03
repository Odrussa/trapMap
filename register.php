<?php
require 'db.php';
require 'session.php';

header('Content-Type: application/json');

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome'] ?? '');
    $cognome = trim($_POST['cognome'] ?? '');
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Controlli obbligatorietà campi
    if ($nome === '' || $cognome === '' || $username === '' || $email === '' || $password === '' || $confirm_password === '') {
        $errors[] = "Tutti i campi sono obbligatori.";
    }

    // Controllo email valida
    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Email non valida.";
    }

    // Controllo password
    if ($password !== '' && strlen($password) < 8) {
        $errors[] = "La password deve essere lunga almeno 8 caratteri.";
    }

    if ($password !== $confirm_password) {
        $errors[] = "Le password non corrispondono.";
    }

    if (empty($errors)) {
        // Controllo email già registrata
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetchColumn() > 0) {
            $errors[] = "Email già registrata.";
        }

        // Controllo username già preso
        if (empty($errors)) {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
            $stmt->execute([$username]);
            if ($stmt->fetchColumn() > 0) {
                $errors[] = "Username già in uso.";
            }
        }
    }

    // Se ci sono errori, li mostriamo e fermiamo
    if (!empty($errors)) {
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit();
    }

    // Tutto ok → hash password e inserimento
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (nome, cognome, username, email, password) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$nome, $cognome, $username, $email, $hash])) {
        session_regenerate_id(true);
        $_SESSION['user_id'] = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'message' => 'Registrazione completata con successo!']);
        exit();
    }

    echo json_encode(['success' => false, 'errors' => ['Errore durante la registrazione.']]);
}
?>
