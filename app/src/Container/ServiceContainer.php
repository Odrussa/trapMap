<?php

declare(strict_types=1);

namespace App\Container;

use InvalidArgumentException;

class ServiceContainer
{
    /** @var array<string, callable(self): mixed> */
    private array $definitions = [];

    /** @var array<string, mixed> */
    private array $instances = [];

    public function set(string $id, callable $factory): void
    {
        $this->definitions[$id] = $factory;
    }

    /**
     * @template T
     * @param class-string<T>|string $id
     * @return T|mixed
     */
    public function get(string $id)
    {
        if (array_key_exists($id, $this->instances)) {
            return $this->instances[$id];
        }

        if (array_key_exists($id, $this->definitions)) {
            $this->instances[$id] = ($this->definitions[$id])($this);
            return $this->instances[$id];
        }

        if (class_exists($id)) {
            $this->instances[$id] = new $id();
            return $this->instances[$id];
        }

        throw new InvalidArgumentException(sprintf('Service "%s" is not registered in the container.', $id));
    }
}
