<?php
/**
 * Sufrah SaaS - Base Controller
 * Handles standardized JSON outputs, input parsing, and sanitation
 */

declare(strict_types=1);

namespace Core;

abstract class Controller
{
    /**
     * Send JSON Response
     */
    protected function json(mixed $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => $statusCode >= 200 && $statusCode < 300,
            'status' => $statusCode,
            'data' => $data,
            'timestamp' => time()
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /**
     * Send Standard Error Response
     */
    protected function error(string $message, int $statusCode = 400, array $errors = []): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode([
            'success' => false,
            'status' => $statusCode,
            'error' => [
                'message' => $message,
                'details' => $errors
            ],
            'timestamp' => time()
        ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit();
    }

    /**
     * Get JSON input from request body with sanitization
     */
    protected function getBody(): array
    {
        $raw = file_get_contents('php://input');
        if (empty($raw)) {
            return [];
        }

        $decoded = json_decode($raw, true);
        return is_array($decoded) ? $this->sanitize($decoded) : [];
    }

    /**
     * Recursive input sanitization against XSS
     */
    protected function sanitize(mixed $data): mixed
    {
        if (is_array($data)) {
            foreach ($data as $key => $val) {
                $data[$key] = $this->sanitize($val);
            }
            return $data;
        }

        if (is_string($data)) {
            return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
        }

        return $data;
    }
}
