<?php
/**
 * Sufrah SaaS - Driver GPS Dispatch & Live Tracking Controller
 */

declare(strict_types=1);

namespace Controllers;

use Core\Controller;
use Core\Database;

class DriverController extends Controller
{
    /**
     * Get active deliveries assigned to a driver
     */
    public function assignedDeliveries(array $params): void
    {
        $driverId = (int) $params['driver_id'];

        $deliveries = Database::query(
            "SELECT d.*, o.order_number, o.total_amount, o.customer_name, o.customer_phone,
                    o.delivery_address, o.delivery_latitude, o.delivery_longitude,
                    b.name_ar as branch_name, b.latitude as branch_lat, b.longitude as branch_lng
             FROM deliveries d
             JOIN orders o ON d.order_id = o.id
             JOIN branches b ON o.branch_id = b.id
             WHERE d.driver_id = :did AND d.status IN ('assigned', 'picked_up', 'in_transit')
             ORDER BY d.assigned_at DESC",
            [':did' => $driverId]
        );

        $this->json($deliveries);
    }

    /**
     * Driver updates live GPS coordinates
     */
    public function updateLocation(): void
    {
        $body = $this->getBody();
        $driverId = (int) ($body['driver_id'] ?? 0);
        $lat = (float) ($body['latitude'] ?? 0);
        $lng = (float) ($body['longitude'] ?? 0);

        if ($driverId <= 0) {
            $this->error('Driver ID required', 422);
        }

        Database::execute(
            "UPDATE drivers SET current_latitude = :lat, current_longitude = :lng, updated_at = NOW()
             WHERE id = :id",
            [':lat' => $lat, ':lng' => $lng, ':id' => $driverId]
        );

        $this->json(['message' => 'Location updated successfully']);
    }

    /**
     * Update delivery progress status
     */
    public function updateDeliveryStatus(array $params): void
    {
        $deliveryId = (int) $params['id'];
        $body = $this->getBody();
        $status = $body['status'] ?? 'picked_up';

        $timestampField = match($status) {
            'picked_up' => ', picked_up_at = NOW()',
            'delivered' => ', delivered_at = NOW()',
            default => ''
        };

        Database::execute(
            "UPDATE deliveries SET status = :st $timestampField WHERE id = :id",
            [':st' => $status, ':id' => $deliveryId]
        );

        if ($status === 'delivered') {
            // Also mark corresponding order as completed
            Database::execute(
                "UPDATE orders SET status = 'completed'
                 WHERE id = (SELECT order_id FROM deliveries WHERE id = :id)",
                [':id' => $deliveryId]
            );
        }

        $this->json(['message' => "Delivery status updated to {$status}"]);
    }
}
