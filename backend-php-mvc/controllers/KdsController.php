<?php
/**
 * Sufrah SaaS - Kitchen Display System (KDS) Controller
 * Real-time Active Kitchen Orders & Ticket Bumping
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;

class KdsController extends Controller
{
    /**
     * Get live active kitchen orders
     */
    public function activeOrders(): void
    {
        $rid = (int) ($_GET['restaurant_id'] ?? 0);
        $bid = (int) ($_GET['branch_id'] ?? 0);

        if ($rid <= 0) {
            $this->error('Restaurant ID is required', 422);
        }

        $params = [':rid' => $rid];
        $branchClause = "";
        if ($bid > 0) {
            $branchClause = " AND o.branch_id = :bid";
            $params[':bid'] = $bid;
        }

        $orders = Database::query(
            "SELECT o.id, o.order_number, o.order_type, o.status, o.created_at, o.notes,
                    t.table_number, b.name_ar as branch_name
             FROM orders o
             LEFT JOIN tables t ON o.table_id = t.id
             JOIN branches b ON o.branch_id = b.id
             WHERE o.restaurant_id = :rid $branchClause
               AND o.status IN ('new', 'in_review', 'preparing')
             ORDER BY o.created_at ASC",
            $params
        );

        if (empty($orders)) {
            $this->json([]);
            return;
        }

        $orderIds = array_column($orders, 'id');
        $inClause = implode(',', array_map('intval', $orderIds));

        $details = Database::query(
            "SELECT od.*, p.prep_time_minutes
             FROM order_details od
             LEFT JOIN products p ON od.product_id = p.id
             WHERE od.order_id IN ($inClause)"
        );

        $detailsByOrder = [];
        foreach ($details as $d) {
            $detailsByOrder[$d['order_id']][] = $d;
        }

        foreach ($orders as &$ord) {
            $ord['items'] = $detailsByOrder[$ord['id']] ?? [];
        }

        $this->json($orders);
    }

    /**
     * Kitchen user marks ticket item or whole order as ready
     */
    public function bumpTicket(array $params): void
    {
        $orderId = (int) $params['id'];
        Database::execute(
            "UPDATE orders SET status = 'ready' WHERE id = :id",
            [':id' => $orderId]
        );

        $this->json(['message' => "Order #{$orderId} bumped to ready status"]);
    }
}
