<?php

declare(strict_types=1);

namespace App\Http;

class Response
{
    /** @var array<string, string> */
    private array $headers;
    private string $body;
    private int $statusCode;

    /**
     * @param array<string, string> $headers
     */
    public function __construct(string $body, int $statusCode = 200, array $headers = [])
    {
        $this->body = $body;
        $this->statusCode = $statusCode;
        $this->headers = $headers;
    }

    public static function html(string $body, int $statusCode = 200): self
    {
        return new self($body, $statusCode, ['Content-Type' => 'text/html; charset=utf-8']);
    }

    public static function json(array $data, int $statusCode = 200): self
    {
        return new self(json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $statusCode, ['Content-Type' => 'application/json']);
    }

    public static function plain(string $body, int $statusCode = 200): self
    {
        return new self($body, $statusCode, ['Content-Type' => 'text/plain; charset=utf-8']);
    }

    public function send(): void
    {
        http_response_code($this->statusCode);

        foreach ($this->headers as $name => $value) {
            header(sprintf('%s: %s', $name, $value));
        }

        echo $this->body;
    }
}
