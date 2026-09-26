<?php
/**
 * Sufrah SaaS - POS (Point of Sale) Controller
 * Fast Barcode Search, Instant Invoicing, Split Payments, and Cash Register
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;

class PosController extends Controller
{
    /**
     * Search product by barcode or title for rapid POS addition
     */
    public function search(): void
    {
        $rid = (int) ($_GET['restaurant_id'] ?? 0);
        $query = trim($_GET['q'] ?? '');

        if ($rid <= 0 || strlen($query) < 1) {
            $this->json([]);
        }

        $products = Database::query(
            "SELECT id, name_ar, name_en, base_price, discount_price, image_url
             FROM products
             WHERE restaurant_id = :rid AND is_available = 1
               AND (name_ar LIKE :q OR name_en LIKE :q OR id = :exactId)
             LIMIT 15",
            [
                ':rid' => $rid,
                ':q' => "%$query%",
                ':exactId' => is_numeric($query) ? (int)$query : -1
            ]
        );

        $this->json($products);
    }

    /**
     * Process POS Instant Checkout
     */
    public function checkout(): void
    {
        $body = $this->getBody();
        $orderController = new OrderController();
        // Sets order_type to dine_in or takeaway, creates invoice with immediate payment
        $orderController->create();
    }
}
