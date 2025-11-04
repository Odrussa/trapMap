<?php
/**
 * Gestore degli osservatori per eventi di autenticazione.
 */
class AuthSubject
{
    private static ?AuthSubject $instance = null;

    /** @var AuthObserver[] */
    private array $observers = [];

    private function __construct()
    {
    }

    public static function getInstance(): AuthSubject
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function attach(AuthObserver $observer): void
    {
        $hash = spl_object_hash($observer);
        $this->observers[$hash] = $observer;
    }

    public function detach(AuthObserver $observer): void
    {
        $hash = spl_object_hash($observer);
        unset($this->observers[$hash]);
    }

    public function notify(string $event, array $payload = []): void
    {
        foreach ($this->observers as $observer) {
            $observer->update($event, $payload);
        }
    }
}
