<?php
/**
 * Sufrah SaaS - Auth Controller
 * Handles user login with password_verify, JWT creation, and role data
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;
use Core\JWT;

class AuthController extends Controller
{
    public function login(): void
    {
        $body = $this->getBody();
        $email = $body['email'] ?? '';
        $password = $body['password'] ?? '';

        if (empty($email) || empty($password)) {
            $this->error('Email and password are required', 422);
        }

        $sql = "SELECT u.*, r.name as role_name, r.display_name_ar as role_title_ar,
                       rest.name_ar as restaurant_name_ar, rest.slug as restaurant_slug
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN restaurants rest ON u.restaurant_id = rest.id
                WHERE u.email = :email AND u.status = 'active'
                LIMIT 1";

        $user = Database::fetchOne($sql, [':email' => $email]);

        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->error('Invalid credentials or inactive account', 401);
        }

        // Generate JWT
        $config = require __DIR__ . '/../config/config.php';
        $payload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role_id' => $user['role_id'],
            'role_name' => $user['role_name'],
            'restaurant_id' => $user['restaurant_id'],
            'branch_id' => $user['branch_id'],
        ];

        $token = JWT::encode($payload, $config['jwt']['secret'], $config['jwt']['expiry_seconds']);

        // Log audit
        Database::execute(
            "INSERT INTO activity_logs (user_id, restaurant_id, action, description, ip_address)
             VALUES (:uid, :rid, 'login', 'User logged in successfully', :ip)",
            [
                ':uid' => $user['id'],
                ':rid' => $user['restaurant_id'],
                ':ip' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1'
            ]
        );

        unset($user['password_hash']);

        $this->json([
            'token' => $token,
            'user' => $user,
            'expires_in' => $config['jwt']['expiry_seconds']
        ]);
    }

    public function me(): void
    {
        $authUser = $_REQUEST['auth_user'] ?? null;
        if (!$authUser) {
            $this->error('Unauthorized', 401);
        }

        $sql = "SELECT u.id, u.name, u.email, u.phone, u.restaurant_id, u.branch_id, u.avatar_url,
                       r.name as role_name, r.display_name_ar, r.display_name_en,
                       rest.name_ar as restaurant_name_ar, rest.slug as restaurant_slug
                FROM users u
                JOIN roles r ON u.role_id = r.id
                LEFT JOIN restaurants rest ON u.restaurant_id = rest.id
                WHERE u.id = :id LIMIT 1";

        $user = Database::fetchOne($sql, [':id' => $authUser['user_id']]);
        if (!$user) {
            $this->error('User not found', 404);
        }

        $this->json($user);
    }
}
