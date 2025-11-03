<?php
require 'db.php'; // qui $pdo è definito
session_start();

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = trim($_POST['nome']);
    $cognome = trim($_POST['cognome']);
    $username = trim($_POST['username']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Controlli obbligatorietà campi
    if (!$nome || !$cognome || !$username || !$email || !$password || !$confirm_password) {
        $errors[] = "Tutti i campi sono obbligatori.";
    }

    // 2Controllo email valida
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Email non valida.";
    }

    // Controllo password
    if (strlen($password) < 6) {
        $errors[] = "La password deve essere lunga almeno 6 caratteri.";
    }

    if ($password !== $confirm_password) {
        $errors[] = "Le password non corrispondono.";
    }

    // 4️⃣ Controllo email già registrata
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetchColumn() > 0) {
        $errors[] = "Email già registrata.";
    }

    // 5️⃣ Controllo username già preso
    $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetchColumn() > 0) {
        $errors[] = "Username già in uso.";
    }

    // Se ci sono errori, li mostriamo e fermiamo
    if (!empty($errors)) {
        // Puoi inviarli in JSON se usi AJAX
        echo json_encode(['success' => false, 'errors' => $errors]);
        exit();
    }

    // Tutto ok → hash password e inserimento
    $hash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (nome, cognome, username, email, password) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$nome, $cognome, $username, $email, $hash])) {
        $_SESSION['user_id'] = $pdo->lastInsertId();
        echo json_encode(['success' => true, 'message' => 'Registrazione completata con successo!']);
        exit();
    } else {
        echo json_encode(['success' => false, 'errors' => ['Errore durante la registrazione.']]);
        exit();
    }
}
?>
