<?php
/**
 * Osservatore che registra su file gli eventi di autenticazione.
 */
class RegistrationLogger implements AuthObserver
{
    private string $logFile;

    public function __construct(string $logFile)
    {
        $this->logFile = $logFile;
        $directory = dirname($logFile);

        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }
    }

    public function update(string $event, array $payload): void
    {
        if ($event !== 'registration' && $event !== 'login') {
            return;
        }

        $message = sprintf(
            '[%s] Evento %s per utente %s (ID: %s, email: %s)%s',
            date('Y-m-d H:i:s'),
            $event,
            $payload['username'] ?? 'sconosciuto',
            $payload['user_id'] ?? 'n/d',
            $payload['email'] ?? 'n/d',
            PHP_EOL
        );

        file_put_contents($this->logFile, $message, FILE_APPEND | LOCK_EX);
    }
}
