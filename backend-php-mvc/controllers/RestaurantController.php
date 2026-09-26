<?php
/**
 * Sufrah SaaS - Restaurant & Multi-Branch Controller
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;

class RestaurantController extends Controller
{
    public function index(): void
    {
        $restaurants = Database::query(
            "SELECT r.*, s.status as subscription_status, p.name_ar as plan_name,
                    (SELECT COUNT(*) FROM branches WHERE restaurant_id = r.id) as branch_count,
                    (SELECT COUNT(*) FROM orders WHERE restaurant_id = r.id) as total_orders
             FROM restaurants r
             LEFT JOIN subscriptions s ON s.restaurant_id = r.id AND s.status = 'active'
             LEFT JOIN plans p ON s.plan_id = p.id
             ORDER BY r.created_at DESC"
        );

        $this->json($restaurants);
    }

    public function show(array $params): void
    {
        $id = (int) $params['id'];
        $restaurant = Database::fetchOne(
            "SELECT r.*, rs.theme_primary_color, rs.enable_online_ordering, rs.enable_table_ordering,
                    rs.whatsapp_number, rs.delivery_fee_base, rs.tax_percentage
             FROM restaurants r
             LEFT JOIN restaurant_settings rs ON rs.restaurant_id = r.id
             WHERE r.id = :id LIMIT 1",
            [':id' => $id]
        );

        if (!$restaurant) {
            $this->error('Restaurant not found', 404);
        }

        $branches = Database::query(
            "SELECT b.*, u.name as manager_name
             FROM branches b
             LEFT JOIN users u ON b.manager_id = u.id
             WHERE b.restaurant_id = :rid",
            [':rid' => $id]
        );

        $restaurant['branches'] = $branches;
        $this->json($restaurant);
    }

    public function create(): void
    {
        $body = $this->getBody();

        if (empty($body['name_ar']) || empty($body['slug'])) {
            $this->error('Arabic name and URL slug are mandatory', 422);
        }

        // Validate slug uniqueness
        $exists = Database::fetchOne("SELECT id FROM restaurants WHERE slug = :slug", [':slug' => $body['slug']]);
        if ($exists) {
            $this->error('Slug is already taken by another restaurant', 409);
        }

        $id = Database::execute(
            "INSERT INTO restaurants (name_ar, name_en, slug, phone, email, website, address, currency, tax_percentage)
             VALUES (:name_ar, :name_en, :slug, :phone, :email, :website, :address, :currency, :tax)",
            [
                ':name_ar' => $body['name_ar'],
                ':name_en' => $body['name_en'] ?? $body['name_ar'],
                ':slug' => $body['slug'],
                ':phone' => $body['phone'] ?? null,
                ':email' => $body['email'] ?? null,
                ':website' => $body['website'] ?? null,
                ':address' => $body['address'] ?? null,
                ':currency' => $body['currency'] ?? 'IQD',
                ':tax' => $body['tax_percentage'] ?? 0.00,
            ]
        );

        // Initialize default restaurant settings
        Database::execute(
            "INSERT INTO restaurant_settings (restaurant_id, theme_primary_color, enable_online_ordering)
             VALUES (:rid, '#f59e0b', 1)",
            [':rid' => $id]
        );

        // Initialize main branch
        Database::execute(
            "INSERT INTO branches (restaurant_id, name_ar, name_en, phone, address)
             VALUES (:rid, 'الفرع الرئيسي', 'Main Branch', :phone, :address)",
            [
                ':rid' => $id,
                ':phone' => $body['phone'] ?? '',
                ':address' => $body['address'] ?? ''
            ]
        );

        $this->json(['message' => 'Restaurant registered successfully', 'id' => $id], 201);
    }
}
