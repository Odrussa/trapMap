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

    // 1️⃣ Validazione base
    if (!$nome || !$cognome || !$username || !$email || !$password || !$confirm_password) {
        $errors[] = "Tutti i campi sono obbligatori.";
    }

    // 2️⃣ Email valida
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Email non valida.";
    }

    // 3️⃣ Password robusta
    if (strlen($password) < 8) {
        $errors[] = "La password deve contenere almeno 8 caratteri.";
    }

    if ($password !== $confirm_password) {
        $errors[] = "Le password non corrispondono.";
    }

    // 4️⃣ Duplicati
    $check = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = :email OR username = :username");
    $check->execute(['email' => $email, 'username' => $username]);
    if ($check->fetchColumn() > 0) {
        $errors[] = "Email o username già registrati.";
    }

    if ($errors) {
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit;
    }

    // 5️⃣ Inserimento utente
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $insert = $pdo->prepare("INSERT INTO users (nome, cognome, username, email, password) VALUES (:n, :c, :u, :e, :p)");

    if ($insert->execute([
        'n' => htmlspecialchars($nome),
        'c' => htmlspecialchars($cognome),
        'u' => htmlspecialchars($username),
        'e' => $email,
        'p' => $hash
    ])) {
        $_SESSION['user_id'] = $pdo->lastInsertId();
        secure_regenerate_session(); // 🧠 previene session fixation

        echo json_encode(['success' => true, 'message' => 'Registrazione completata!']);
    } else {
        echo json_encode(['success' => false, 'errors' => ['Errore durante la registrazione.']]);
    }
}
?>
