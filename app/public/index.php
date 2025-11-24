<?php

declare(strict_types=1);

use App\Http\Request;
use App\Http\Router;

require __DIR__ . '/../bootstrap.php';

$container = require __DIR__ . '/../config/services.php';

/** @var Router $router */
$router = $container->get(Router::class);

$response = $router->dispatch(Request::fromGlobals());
$response->send();
