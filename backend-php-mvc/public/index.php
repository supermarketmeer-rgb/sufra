<?php
/**
 * Sufrah SaaS - PHP 8 MVC Entry Point
 * Handles CORS, autoloading, and routing dispatch
 */

declare(strict_types=1);

// Handle Cross-Origin Resource Sharing (CORS)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Simple PSR-4 Autoloader
spl_autoload_register(function ($class) {
    $prefixMap = [
        'Core\\' => __DIR__ . '/../core/',
        'Controllers\\' => __DIR__ . '/../controllers/',
        'Models\\' => __DIR__ . '/../models/',
    ];

    foreach ($prefixMap as $prefix => $baseDir) {
        $len = strlen($prefix);
        if (strncmp($prefix, $class, $len) === 0) {
            $relativeClass = substr($class, $len);
            $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
            if (file_exists($file)) {
                require $file;
                return;
            }
        }
    }
});

try {
    /** @var \Core\Router $router */
    $router = require __DIR__ . '/../routes/api.php';
    $router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
} catch (\Throwable $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => false,
        'status' => 500,
        'message' => 'Internal Server Exception: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
