<?php
if (!defined('TRAPMAP_BOOTSTRAP')) {
    define('TRAPMAP_BOOTSTRAP', true);

    require_once __DIR__ . '/Database.php';
    require_once __DIR__ . '/SessionManager.php';
    require_once __DIR__ . '/AuthObserver.php';
    require_once __DIR__ . '/AuthSubject.php';
    require_once __DIR__ . '/RegistrationLogger.php';
    require_once __DIR__ . '/UserRepository.php';
    require_once __DIR__ . '/ArtistRepository.php';
    require_once __DIR__ . '/ArtistCardRequestRepository.php';
    require_once __DIR__ . '/SuggestionsRepository.php';

    $subject = AuthSubject::getInstance();
    $subject->attach(new RegistrationLogger(__DIR__ . '/../logs/auth.log'));
}
