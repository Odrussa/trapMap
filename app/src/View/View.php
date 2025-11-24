<?php

declare(strict_types=1);

namespace App\View;

use InvalidArgumentException;

class View
{
    private string $basePath;

    public function __construct(string $basePath)
    {
        $this->basePath = rtrim($basePath, '/');
    }

    /**
     * @param array<string, mixed> $data
     */
    public function render(string $template, array $data = []): string
    {
        $path = $this->basePath . '/' . ltrim($template, '/');

        if (!is_readable($path)) {
            throw new InvalidArgumentException(sprintf('View "%s" not found.', $template));
        }

        extract($data, EXTR_SKIP);

        ob_start();
        include $path;

        return (string) ob_get_clean();
    }
}
