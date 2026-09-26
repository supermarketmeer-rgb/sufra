<?php
/**
 * Sufrah SaaS - JWT Authentication & RBAC Middleware
 */

declare(strict_types=1);

namespace Core;

class AuthMiddleware
{
    private array $allowedRoles;

    public function __construct(array $allowedRoles = [])
    {
        $this->allowedRoles = $allowedRoles;
    }

    public function handle(): bool
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

        if (!str_starts_with($authHeader, 'Bearer ')) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'status' => 401,
                'message' => 'Authorization token is missing or malformed'
            ]);
            return false;
        }

        $token = substr($authHeader, 7);
        $config = require __DIR__ . '/../config/config.php';
        $payload = JWT::decode($token, $config['jwt']['secret']);

        if (!$payload) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'status' => 401,
                'message' => 'Invalid, tampered, or expired JWT authentication token'
            ]);
            return false;
        }

        // Store authenticated user in global request context
        $_REQUEST['auth_user'] = $payload;

        // Role verification (if specific roles were required)
        if (!empty($this->allowedRoles)) {
            $userRole = $payload['role_name'] ?? '';
            if (!in_array($userRole, $this->allowedRoles, true)) {
                http_response_code(403);
                echo json_encode([
                    'success' => false,
                    'status' => 403,
                    'message' => "Access denied. Required roles: " . implode(', ', $this->allowedRoles)
                ]);
                return false;
            }
        }

        return true;
    }
}
