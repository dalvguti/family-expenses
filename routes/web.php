<?php

use Illuminate\Support\Facades\Route;

// Devuelve el shell de la SPA para cualquier ruta que no sea la API,
// de modo que React Router maneje el enrutamiento del lado del cliente.
Route::get('/{any?}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
