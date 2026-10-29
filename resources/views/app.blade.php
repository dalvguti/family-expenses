<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="app-base" content="{{ rtrim(parse_url(url('/'), PHP_URL_PATH) ?: '', '/') }}">
        <meta name="theme-color" content="#000000">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-title" content="Family Expenses">

        <link rel="icon" href="{{ url('/favicon.ico') }}">
        <link rel="apple-touch-icon" href="{{ url('/logo192.png') }}">
        <link rel="manifest" href="{{ url('/manifest.json') }}">

        <title>Family Expenses</title>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    </head>
    <body>
        <div id="app"></div>
    </body>
</html>
