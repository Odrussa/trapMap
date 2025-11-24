<?php

declare(strict_types=1);

use App\Container\ServiceContainer;
use App\Controllers\HomeController;
use App\Http\Response;
use App\Http\Router;
use App\View\View;

return (function () {
    $container = new ServiceContainer();

    $container->set(View::class, function (): View {
        return new View(dirname(__DIR__) . '/resources/views');
    });

    $container->set(HomeController::class, function (ServiceContainer $container): HomeController {
        return new HomeController($container->get(View::class));
    });

    $container->set(Router::class, function (ServiceContainer $container): Router {
        $router = new Router();

        $router->get('/', [$container->get(HomeController::class), 'index']);

        $router->get('/health', function (): Response {
            return Response::json(['status' => 'ok']);
        });

        return $router;
    });

    return $container;
})();
