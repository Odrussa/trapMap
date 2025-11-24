<?php

declare(strict_types=1);

namespace App\Http;

class Request
{
    private string $method;
    private string $path;
    /** @var array<string, mixed> */
    private array $queryParams;
    /** @var array<string, mixed> */
    private array $parsedBody;

    /** @param array<string, mixed> $queryParams */
    public function __construct(string $method, string $path, array $queryParams = [], array $parsedBody = [])
    {
        $this->method = strtoupper($method);
        $this->path = $path;
        $this->queryParams = $queryParams;
        $this->parsedBody = $parsedBody;
    }

    public static function fromGlobals(): self
    {
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
        $uri = $_SERVER['REQUEST_URI'] ?? '/';
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';

        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $parsedBody = [];

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $decoded = json_decode($raw ?: '[]', true);
            if (is_array($decoded)) {
                $parsedBody = $decoded;
            }
        } else {
            $parsedBody = $_POST;
        }

        return new self($method, $path, $_GET, $parsedBody);
    }

    public function getMethod(): string
    {
        return $this->method;
    }

    public function getPath(): string
    {
        return $this->path;
    }

    /** @return array<string, mixed> */
    public function getQueryParams(): array
    {
        return $this->queryParams;
    }

    /** @return array<string, mixed> */
    public function getParsedBody(): array
    {
        return $this->parsedBody;
    }
}
