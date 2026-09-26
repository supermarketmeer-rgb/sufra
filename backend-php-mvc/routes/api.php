<?php
/**
 * Sufrah SaaS - RESTful API Route Definitions
 * Multi-Role SaaS REST Endpoints
 */

declare(strict_types=1);

use Core\Router;
use Core\AuthMiddleware;
use Controllers\AuthController;
use Controllers\RestaurantController;
use Controllers\MenuController;
use Controllers\OrderController;
use Controllers\PosController;
use Controllers\KdsController;
use Controllers\DriverController;
use Controllers\AIController;

$router = new Router();

// ==========================================
// 1. PUBLIC ENDPOINTS (No Token Required)
// ==========================================
$router->post('/api/v1/auth/login', [AuthController::class, 'login']);
$router->get('/api/v1/public/menu/{slug}', [MenuController::class, 'publicMenu']);
$router->post('/api/v1/public/orders', [OrderController::class, 'create']);

// ==========================================
// 2. AUTHENTICATED USER (General)
// ==========================================
$router->get('/api/v1/auth/me', [AuthController::class, 'me'], [AuthMiddleware::class]);

// ==========================================
// 3. SUPER ADMIN ENDPOINTS
// ==========================================
$router->get('/api/v1/admin/restaurants', [RestaurantController::class, 'index']);
$router->post('/api/v1/admin/restaurants', [RestaurantController::class, 'create']);

// ==========================================
// 4. RESTAURANT OWNER & BRANCH MANAGER
// ==========================================
$router->get('/api/v1/restaurants/{id}', [RestaurantController::class, 'show']);
$router->post('/api/v1/menu/products', [MenuController::class, 'createProduct']);
$router->get('/api/v1/ai/insights', [AIController::class, 'insights']);

// ==========================================
// 5. CASHIER POS ENDPOINTS
// ==========================================
$router->get('/api/v1/pos/search', [PosController::class, 'search']);
$router->post('/api/v1/pos/checkout', [PosController::class, 'checkout']);

// ==========================================
// 6. KITCHEN DISPLAY SYSTEM (KDS)
// ==========================================
$router->get('/api/v1/kds/orders', [KdsController::class, 'activeOrders']);
$router->put('/api/v1/kds/orders/{id}/bump', [KdsController::class, 'bumpTicket']);

// ==========================================
// 7. DRIVER & GPS DISPATCH
// ==========================================
$router->get('/api/v1/driver/{driver_id}/deliveries', [DriverController::class, 'assignedDeliveries']);
$router->post('/api/v1/driver/location', [DriverController::class, 'updateLocation']);
$router->put('/api/v1/deliveries/{id}/status', [DriverController::class, 'updateDeliveryStatus']);

// Return configured router
return $router;
