<?php
/**
 * Interfaccia per gli osservatori degli eventi di autenticazione.
 */
interface AuthObserver
{
    public function update(string $event, array $payload): void;
}
