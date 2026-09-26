<?php
/**
 * Sufrah SaaS - Pure PHP 8 JWT (JSON Web Token) Implementation
 * Uses HMAC-SHA256 with Timing-Safe Verification
 */

declare(strict_types=1);

namespace Core;

class JWT
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }

    /**
     * Generate signed JWT
     */
    public static function encode(array $payload, string $secret, int $expirySeconds = 604800): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => 'HS256'
        ];

        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $expirySeconds;

        $encodedHeader = self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $encodedPayload = self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));

        $signature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", $secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "$encodedHeader.$encodedPayload.$encodedSignature";
    }

    /**
     * Verify and decode JWT
     */
    public static function decode(string $token, string $secret): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        // Verify Signature
        $expectedSignature = hash_hmac('sha256', "$encodedHeader.$encodedPayload", $secret, true);
        $providedSignature = self::base64UrlDecode($encodedSignature);

        if (!hash_equals($expectedSignature, $providedSignature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!$payload || !isset($payload['exp'])) {
            return null;
        }

        // Check Expiration
        if (time() > $payload['exp']) {
            return null;
        }

        return $payload;
    }
}
