<?php
/**
 * Sufrah SaaS - Menu & Catalog Controller
 * Categories, Products, Sizes, Addons & Customer Public Menu API
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;

class MenuController extends Controller
{
    /**
     * Get full public menu for customer view by restaurant slug or ID
     */
    public function publicMenu(array $params): void
    {
        $slug = $params['slug'];

        $restaurant = Database::fetchOne(
            "SELECT r.id, r.name_ar, r.name_en, r.slug, r.logo_url, r.cover_url, r.currency, r.tax_percentage,
                    rs.theme_primary_color, rs.delivery_fee_base, rs.enable_online_ordering, rs.enable_table_ordering
             FROM restaurants r
             LEFT JOIN restaurant_settings rs ON rs.restaurant_id = r.id
             WHERE r.slug = :slug AND r.status = 'active' LIMIT 1",
            [':slug' => $slug]
        );

        if (!$restaurant) {
            $this->error('Restaurant not found or suspended', 404);
        }

        $rid = (int) $restaurant['id'];

        // Get Categories
        $categories = Database::query(
            "SELECT id, name_ar, name_en, slug, icon_name, sort_order
             FROM categories
             WHERE restaurant_id = :rid AND is_active = 1
             ORDER BY sort_order ASC, id ASC",
            [':rid' => $rid]
        );

        // Get Products with Sizes and Addons
        $products = Database::query(
            "SELECT p.*, c.slug as category_slug
             FROM products p
             JOIN categories c ON p.category_id = c.id
             WHERE p.restaurant_id = :rid AND p.is_available = 1
             ORDER BY p.sort_order ASC, p.id DESC",
            [':rid' => $rid]
        );

        $productIds = array_column($products, 'id');
        $sizesByProd = [];
        $addonsByProd = [];

        if (!empty($productIds)) {
            $inClause = implode(',', array_map('intval', $productIds));

            $sizes = Database::query("SELECT * FROM product_sizes WHERE product_id IN ($inClause)");
            foreach ($sizes as $s) {
                $sizesByProd[$s['product_id']][] = $s;
            }

            $addons = Database::query("SELECT * FROM product_addons WHERE product_id IN ($inClause)");
            foreach ($addons as $a) {
                $addonsByProd[$a['product_id']][] = $a;
            }
        }

        foreach ($products as &$p) {
            $p['sizes'] = $sizesByProd[$p['id']] ?? [];
            $p['addons'] = $addonsByProd[$p['id']] ?? [];
        }

        $this->json([
            'restaurant' => $restaurant,
            'categories' => $categories,
            'products' => $products
        ]);
    }

    public function createProduct(): void
    {
        $body = $this->getBody();

        if (empty($body['name_ar']) || empty($body['category_id']) || !isset($body['base_price'])) {
            $this->error('Name, category, and base price are required', 422);
        }

        $productId = Database::execute(
            "INSERT INTO products (restaurant_id, category_id, name_ar, name_en, description_ar, base_price, discount_price, calories, prep_time_minutes, is_available)
             VALUES (:rid, :cid, :name_ar, :name_en, :desc_ar, :price, :disc, :cal, :prep, :avail)",
            [
                ':rid' => $body['restaurant_id'],
                ':cid' => $body['category_id'],
                ':name_ar' => $body['name_ar'],
                ':name_en' => $body['name_en'] ?? $body['name_ar'],
                ':desc_ar' => $body['description_ar'] ?? null,
                ':price' => $body['base_price'],
                ':disc' => $body['discount_price'] ?? null,
                ':cal' => $body['calories'] ?? null,
                ':prep' => $body['prep_time_minutes'] ?? 15,
                ':avail' => $body['is_available'] ?? 1,
            ]
        );

        $this->json(['message' => 'Product added successfully', 'product_id' => $productId], 201);
    }
}
