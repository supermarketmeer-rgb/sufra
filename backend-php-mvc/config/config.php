<?php
/**
 * Sufrah SaaS - Configuration File
 * PHP 8.0+ Environment
 */

declare(strict_types=1);

return [
    'app' => [
        'name' => 'Sufrah SaaS Platform',
        'env' => 'production',
        'debug' => false,
        'url' => 'https://platform.sufrah.menu',
        'api_version' => 'v1',
        'timezone' => 'Asia/Baghdad',
    ],
    'db' => [
        'host' => getenv('DB_HOST') ?: '127.0.0.1',
        'port' => getenv('DB_PORT') ?: '3306',
        'database' => getenv('DB_DATABASE') ?: 'sufrah_saas_db',
        'username' => getenv('DB_USERNAME') ?: 'root',
        'password' => getenv('DB_PASSWORD') ?: '',
        'charset' => 'utf8mb4',
        'options' => [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ],
    ],
    'jwt' => [
        'secret' => getenv('JWT_SECRET') ?: 'sufrah_super_secret_jwt_key_99812_secure_token',
        'expiry_seconds' => 86400 * 7, // 7 days
        'issuer' => 'sufrah.platform',
    ],
    'storage' => [
        'upload_dir' => __DIR__ . '/../public/uploads/',
        'max_file_size_mb' => 10,
        'allowed_image_types' => ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    ],
    'payment_gateways' => [
        'zaincash' => [
            'merchant_id' => getenv('ZAINCASH_MERCHANT_ID') ?: '',
            'secret' => getenv('ZAINCASH_SECRET') ?: '',
            'test_mode' => true,
        ],
        'qicard' => [
            'terminal_id' => getenv('QICARD_TERMINAL_ID') ?: '',
            'secret' => getenv('QICARD_SECRET') ?: '',
        ],
        'stripe' => [
            'public_key' => getenv('STRIPE_PUBLIC_KEY') ?: '',
            'secret_key' => getenv('STRIPE_SECRET_KEY') ?: '',
        ],
    ],
];
