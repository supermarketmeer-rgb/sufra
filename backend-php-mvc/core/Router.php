<?php
/**
 * Sufrah SaaS - RESTful Router with Parameter Extraction & Middleware
 */

declare(strict_types=1);

namespace Core;

class Router
{
    private array $routes = [];
    private array $middlewares = [];

    public function get(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('GET', $path, $handler, $middleware);
    }

    public function post(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('POST', $path, $handler, $middleware);
    }

    public function put(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('PUT', $path, $handler, $middleware);
    }

    public function delete(string $path, callable|array $handler, array $middleware = []): self
    {
        return $this->addRoute('DELETE', $path, $handler, $middleware);
    }

    private function addRoute(string $method, string $path, callable|array $handler, array $middleware = []): self
    {
        // Convert path with {param} to regex pattern
        $pattern = preg_replace('/\{([a-zA-Z0-9_]+)\}/', '(?P<$1>[^/]+)', $path);
        $pattern = "#^" . $pattern . "$#";

        $this->routes[] = [
            'method' => $method,
            'pattern' => $pattern,
            'handler' => $handler,
            'middleware' => $middleware,
        ];

        return $this;
    }

    public function dispatch(string $requestMethod, string $requestUri): void
    {
        // Remove query parameters
        $path = parse_url($requestUri, PHP_URL_PATH);

        // Handle preflight OPTIONS request
        if ($requestMethod === 'OPTIONS') {
            http_response_code(204);
            exit();
        }

        foreach ($this->routes as $route) {
            if ($route['method'] === $requestMethod && preg_match($route['pattern'], $path, $matches)) {
                // Filter named parameters
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);

                // Run middlewares
                foreach ($route['middleware'] as $mw) {
                    $mwInstance = new $mw();
                    $mwResult = $mwInstance->handle();
                    if ($mwResult !== true) {
                        return; // Stopped by middleware
                    }
                }

                // Execute handler
                $handler = $route['handler'];
                if (is_array($handler)) {
                    [$controllerClass, $methodName] = $handler;
                    $controller = new $controllerClass();
                    $controller->$methodName($params);
                } elseif (is_callable($handler)) {
                    call_user_func($handler, $params);
                }
                return;
            }
        }

        // 404 Route Not Found
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'code' => 404,
            'message' => 'Endpoint route not found on Sufrah REST API',
            'path' => $path
        ], JSON_UNESCAPED_UNICODE);
    }
}
