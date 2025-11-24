<?php

declare(strict_types=1);

namespace App\Http;

use Closure;
use InvalidArgumentException;

class Router
{
    /** @var array<string, array<string, callable>> */
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function addRoute(string $method, string $path, callable $handler): void
    {
        $method = strtoupper($method);
        $this->routes[$method][$path] = $handler;
    }

    public function dispatch(Request $request): Response
    {
        $method = $request->getMethod();
        $path = $request->getPath();

        $routes = $this->routes[$method] ?? [];

        if (!array_key_exists($path, $routes)) {
            return Response::json(['error' => 'Not Found'], 404);
        }

        $handler = $routes[$path];
        $response = $handler($request);

        if (!$response instanceof Response) {
            throw new InvalidArgumentException('Route handler must return an instance of ' . Response::class);
        }

        return $response;
    }
}
