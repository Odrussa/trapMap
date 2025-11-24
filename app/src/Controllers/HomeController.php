<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Http\Request;
use App\Http\Response;
use App\View\View;

class HomeController
{
    private View $view;

    public function __construct(View $view)
    {
        $this->view = $view;
    }

    public function index(Request $request): Response
    {
        $body = $this->view->render('home.php');

        return Response::html($body);
    }
}
