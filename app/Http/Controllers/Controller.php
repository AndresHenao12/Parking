<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Validation\ValidatesRequests;

abstract class Controller
{
    use AuthorizesRequests, ValidatesRequests;

    protected function authorizeRole(array $roles): void
    {
        $user = auth()->user();

        abort_unless($user && in_array($user->role, $roles, true), 403, 'No tienes permisos para acceder a este módulo.');
    }
}
