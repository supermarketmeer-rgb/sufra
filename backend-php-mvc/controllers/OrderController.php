<?php
/**
 * Sufrah SaaS - Order Processing Controller
 * Manages Dine-in, Takeaway, Delivery, Pre-orders & Status State Machine
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;

class OrderController extends Controller
{
    /**
     * Customer or Cashier creates a new order
     */
    public function create(): void
    {
        $body = $this->getBody();

        if (empty($body['restaurant_id']) || empty($body['branch_id']) || empty($body['items'])) {
            $this->error('Missing mandatory order data (restaurant, branch, or items)', 422);
        }

        $rid = (int) $body['restaurant_id'];
        $bid = (int) $body['branch_id'];
        $orderType = $body['order_type'] ?? 'dine_in';
        $tableId = !empty($body['table_id']) ? (int) $body['table_id'] : null;

        // Generate Human-friendly Order Number e.g. ORD-2026-9481
        $orderNumber = 'ORD-' . date('ymd') . '-' . rand(1000, 9999);

        // Calculate Subtotal from items
        $subtotal = 0.0;
        foreach ($body['items'] as $item) {
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $subtotal += ($qty * $unitPrice);
        }

        $taxRate = (float) ($body['tax_percentage'] ?? 0.0);
        $taxAmount = ($subtotal * $taxRate) / 100.0;
        $discountAmount = (float) ($body['discount_amount'] ?? 0.0);
        $deliveryFee = ($orderType === 'delivery') ? (float) ($body['delivery_fee'] ?? 3000.0) : 0.0;
        $totalAmount = max(0, $subtotal + $taxAmount + $deliveryFee - $discountAmount);

        // Insert Order
        $orderId = Database::execute(
            "INSERT INTO orders (order_number, restaurant_id, branch_id, table_id, order_type, status,
                                 subtotal, tax_amount, discount_amount, delivery_fee, total_amount,
                                 customer_name, customer_phone, delivery_address, notes)
             VALUES (:num, :rid, :bid, :tid, :type, 'new', :sub, :tax, :disc, :deliv, :tot, :cname, :cphone, :addr, :notes)",
            [
                ':num' => $orderNumber,
                ':rid' => $rid,
                ':bid' => $bid,
                ':tid' => $tableId,
                ':type' => $orderType,
                ':sub' => $subtotal,
                ':tax' => $taxAmount,
                ':disc' => $discountAmount,
                ':deliv' => $deliveryFee,
                ':tot' => $totalAmount,
                ':cname' => $body['customer_name'] ?? 'Walk-in Guest',
                ':cphone' => $body['customer_phone'] ?? null,
                ':addr' => $body['delivery_address'] ?? null,
                ':notes' => $body['notes'] ?? null,
            ]
        );

        // Insert Order Details
        foreach ($body['items'] as $item) {
            $qty = max(1, (int) ($item['quantity'] ?? 1));
            $unitPrice = (float) ($item['unit_price'] ?? 0);
            $itemSubtotal = $qty * $unitPrice;

            Database::execute(
                "INSERT INTO order_details (order_id, product_id, product_name, unit_price, quantity, subtotal, selected_addons, special_instructions)
                 VALUES (:oid, :pid, :pname, :uprice, :qty, :sub, :addons, :instructions)",
                [
                    ':oid' => $orderId,
                    ':pid' => (int) $item['product_id'],
                    ':pname' => $item['product_name'] ?? 'Item',
                    ':uprice' => $unitPrice,
                    ':qty' => $qty,
                    ':sub' => $itemSubtotal,
                    ':addons' => isset($item['selected_addons']) ? json_encode($item['selected_addons']) : null,
                    ':instructions' => $item['special_instructions'] ?? null,
                ]
            );
        }

        // If payment method provided, record payment
        if (!empty($body['payment_method'])) {
            Database::execute(
                "INSERT INTO payments (order_id, restaurant_id, payment_method, amount, status)
                 VALUES (:oid, :rid, :method, :amt, 'completed')",
                [
                    ':oid' => $orderId,
                    ':rid' => $rid,
                    ':method' => strtolower($body['payment_method']),
                    ':amt' => $totalAmount
                ]
            );
        }

        // Dispatch Notification
        Database::execute(
            "INSERT INTO notifications (restaurant_id, channel, recipient, event, title, message)
             VALUES (:rid, 'system', 'branch_manager', 'new_order', 'طلب جديد وارد', :msg)",
            [
                ':rid' => $rid,
                ':msg' => "طلب رقم {$orderNumber} بقيمة {$totalAmount} {$orderType}"
            ]
        );

        $this->json([
            'message' => 'Order created successfully',
            'order_id' => $orderId,
            'order_number' => $orderNumber,
            'total_amount' => $totalAmount
        ], 201);
    }

    /**
     * Update Order Status (new -> in_review -> preparing -> ready -> out_for_delivery -> completed -> cancelled)
     */
    public function updateStatus(array $params): void
    {
        $orderId = (int) $params['id'];
        $body = $this->getBody();
        $newStatus = $body['status'] ?? '';

        $validStatuses = ['new', 'in_review', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'];
        if (!in_array($newStatus, $validStatuses, true)) {
            $this->error('Invalid status transition', 422);
        }

        Database::execute(
            "UPDATE orders SET status = :status WHERE id = :id",
            [':status' => $newStatus, ':id' => $orderId]
        );

        $this->json(['message' => "Order #{$orderId} status updated to {$newStatus}"]);
    }
}
