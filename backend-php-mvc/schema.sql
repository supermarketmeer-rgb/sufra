-- =====================================================================
-- SUFRAH SAAS - RESTAURANT & QR ORDERING PLATFORM
-- Complete MySQL 8.0+ Database Schema (All 28 Tables with Constraints & Indexes)
-- Multi-Tenant SaaS Architecture with RBAC & Audit Trail
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
-- 1. system_settings: Global SaaS Platform Settings
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) NOT NULL UNIQUE,
  `value` LONGTEXT NULL,
  `group` VARCHAR(50) DEFAULT 'general',
  `is_public` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_settings_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. plans: SaaS Subscription Plans (Free, Pro, Enterprise)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `plans`;
CREATE TABLE `plans` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(50) NOT NULL UNIQUE,
  `price_monthly` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `price_yearly` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `currency` VARCHAR(10) DEFAULT 'USD',
  `max_branches` INT NOT NULL DEFAULT 1,
  `max_tables` INT NOT NULL DEFAULT 10,
  `max_products` INT NOT NULL DEFAULT 50,
  `has_pos` TINYINT(1) DEFAULT 0,
  `has_kds` TINYINT(1) DEFAULT 0,
  `has_delivery_gps` TINYINT(1) DEFAULT 0,
  `has_ai_analytics` TINYINT(1) DEFAULT 0,
  `has_custom_domain` TINYINT(1) DEFAULT 0,
  `features` JSON NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. roles: Role Based Access Control
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `display_name_ar` VARCHAR(100) NOT NULL,
  `display_name_en` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. permissions: Granular Permissions
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `module` VARCHAR(50) NOT NULL,
  `display_name_ar` VARCHAR(150) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 5. role_permissions: Pivot Role-Permission
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `role_id` INT UNSIGNED NOT NULL,
  `permission_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`role_id`, `permission_id`),
  CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rp_perm` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 6. restaurants: Independent Tenants
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE `restaurants` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name_ar` VARCHAR(200) NOT NULL,
  `name_en` VARCHAR(200) NOT NULL,
  `slug` VARCHAR(100) NOT NULL UNIQUE,
  `custom_domain` VARCHAR(150) NULL UNIQUE,
  `logo_url` VARCHAR(500) NULL,
  `cover_url` VARCHAR(500) NULL,
  `description_ar` TEXT NULL,
  `description_en` TEXT NULL,
  `phone` VARCHAR(30) NULL,
  `email` VARCHAR(150) NULL,
  `website` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `currency` VARCHAR(10) DEFAULT 'IQD',
  `tax_percentage` DECIMAL(5,2) DEFAULT 0.00,
  `status` ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_restaurant_slug` (`slug`),
  INDEX `idx_restaurant_domain` (`custom_domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 7. restaurant_settings: Specific restaurant config & theme
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `restaurant_settings`;
CREATE TABLE `restaurant_settings` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL UNIQUE,
  `theme_primary_color` VARCHAR(20) DEFAULT '#f59e0b',
  `theme_secondary_color` VARCHAR(20) DEFAULT '#1e293b',
  `enable_online_ordering` TINYINT(1) DEFAULT 1,
  `enable_table_ordering` TINYINT(1) DEFAULT 1,
  `enable_takeaway` TINYINT(1) DEFAULT 1,
  `enable_delivery` TINYINT(1) DEFAULT 1,
  `enable_reservations` TINYINT(1) DEFAULT 1,
  `enable_loyalty` TINYINT(1) DEFAULT 1,
  `loyalty_points_per_unit` DECIMAL(8,2) DEFAULT 1.00,
  `minimum_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `delivery_fee_base` DECIMAL(10,2) DEFAULT 3000.00,
  `whatsapp_number` VARCHAR(30) NULL,
  `telegram_bot_token` VARCHAR(255) NULL,
  `telegram_chat_id` VARCHAR(100) NULL,
  `receipt_footer_note` TEXT NULL,
  `qr_style` JSON NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_settings_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 8. subscriptions: Restaurant Subscription history
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `subscriptions`;
CREATE TABLE `subscriptions` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `plan_id` INT UNSIGNED NOT NULL,
  `starts_at` DATE NOT NULL,
  `ends_at` DATE NOT NULL,
  `status` ENUM('active', 'expired', 'trialing', 'cancelled') DEFAULT 'active',
  `amount_paid` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `payment_method` VARCHAR(50) DEFAULT 'credit_card',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sub_restaurant` (`restaurant_id`),
  INDEX `idx_sub_status` (`status`),
  CONSTRAINT `fk_sub_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sub_plan` FOREIGN KEY (`plan_id`) REFERENCES `plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 9. users: Admin, Owner, Manager, Cashier, Kitchen, Driver
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NULL,
  `role_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  `branch_id` INT UNSIGNED NULL,
  `avatar_url` VARCHAR(500) NULL,
  `last_login_at` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role_id`),
  INDEX `idx_users_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_users_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 10. branches: Multiple Locations per Restaurant
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `branches`;
CREATE TABLE `branches` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `manager_id` INT UNSIGNED NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NULL,
  `address` TEXT NULL,
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `opening_time` TIME DEFAULT '08:00:00',
  `closing_time` TIME DEFAULT '01:00:00',
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_branch_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_branch_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_branch_manager` FOREIGN KEY (`manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 11. tables: Restaurant Dining Tables with QR Codes
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `tables`;
CREATE TABLE `tables` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT UNSIGNED NOT NULL,
  `table_number` VARCHAR(30) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 4,
  `status` ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
  `qr_token` VARCHAR(64) NOT NULL UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_table_branch` (`branch_id`),
  CONSTRAINT `fk_table_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 12. categories: Menu Categories (وجبات رئيسية, مشويات, مقبلات, حلويات...)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `slug` VARCHAR(100) NOT NULL,
  `icon_name` VARCHAR(50) DEFAULT 'utensils',
  `sort_order` INT NOT NULL DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cat_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_cat_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 13. products: Menu Items & Dishes
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `category_id` INT UNSIGNED NOT NULL,
  `name_ar` VARCHAR(200) NOT NULL,
  `name_en` VARCHAR(200) NOT NULL,
  `description_ar` TEXT NULL,
  `description_en` TEXT NULL,
  `base_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_price` DECIMAL(10,2) NULL,
  `image_url` VARCHAR(500) NULL,
  `video_url` VARCHAR(500) NULL,
  `calories` INT NULL,
  `prep_time_minutes` INT DEFAULT 15,
  `ingredients_ar` TEXT NULL,
  `ingredients_en` TEXT NULL,
  `is_available` TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_prod_restaurant` (`restaurant_id`),
  INDEX `idx_prod_category` (`category_id`),
  CONSTRAINT `fk_prod_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 14. product_images: Product Gallery
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `image_url` VARCHAR(500) NOT NULL,
  `is_primary` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  INDEX `idx_prod_img` (`product_id`),
  CONSTRAINT `fk_img_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 15. product_sizes: Product Variations (Small, Medium, Large)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `product_sizes`;
CREATE TABLE `product_sizes` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `name_ar` VARCHAR(100) NOT NULL,
  `name_en` VARCHAR(100) NOT NULL,
  `extra_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `is_default` TINYINT(1) DEFAULT 0,
  INDEX `idx_size_product` (`product_id`),
  CONSTRAINT `fk_size_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 16. product_addons: Extra Options (Cheese, Sauce, Fries, Drink)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `product_addons`;
CREATE TABLE `product_addons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `product_id` INT UNSIGNED NOT NULL,
  `name_ar` VARCHAR(150) NOT NULL,
  `name_en` VARCHAR(150) NOT NULL,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `is_free` TINYINT(1) DEFAULT 0,
  `max_quantity` INT DEFAULT 5,
  INDEX `idx_addon_product` (`product_id`),
  CONSTRAINT `fk_addon_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 17. customers: Customer Accounts & Profiles
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `email` VARCHAR(150) NULL,
  `password_hash` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `latitude` DECIMAL(10,8) NULL,
  `longitude` DECIMAL(11,8) NULL,
  `loyalty_points` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_cust_phone_rest` (`restaurant_id`, `phone`),
  INDEX `idx_cust_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_cust_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 18. orders: Core Orders (Dine-in, Takeaway, Delivery, Pre-order)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(50) NOT NULL UNIQUE,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NULL,
  `table_id` INT UNSIGNED NULL,
  `order_type` ENUM('dine_in', 'takeaway', 'delivery', 'pre_order') NOT NULL,
  `status` ENUM('new', 'in_review', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled') DEFAULT 'new',
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `tax_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `delivery_fee` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `customer_name` VARCHAR(150) NULL,
  `customer_phone` VARCHAR(30) NULL,
  `delivery_address` TEXT NULL,
  `delivery_latitude` DECIMAL(10,8) NULL,
  `delivery_longitude` DECIMAL(11,8) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_order_restaurant` (`restaurant_id`),
  INDEX `idx_order_branch` (`branch_id`),
  INDEX `idx_order_status` (`status`),
  INDEX `idx_order_created` (`created_at`),
  CONSTRAINT `fk_order_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_order_table` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 19. order_details: Line Items
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `order_details`;
CREATE TABLE `order_details` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `product_size_id` INT UNSIGNED NULL,
  `product_name` VARCHAR(200) NOT NULL,
  `unit_price` DECIMAL(10,2) NOT NULL,
  `quantity` INT NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(10,2) NOT NULL,
  `selected_addons` JSON NULL,
  `special_instructions` VARCHAR(255) NULL,
  INDEX `idx_detail_order` (`order_id`),
  CONSTRAINT `fk_detail_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_detail_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 20. payments: Transactions (Cash, Visa, MC, ZainCash, AsiaHawala, QiCard)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `payment_method` ENUM('cash', 'visa', 'mastercard', 'zaincash', 'asia_hawala', 'qicard') NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `transaction_reference` VARCHAR(150) NULL,
  `status` ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
  `paid_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pay_order` (`order_id`),
  INDEX `idx_pay_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_pay_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pay_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 21. drivers: Delivery Fleet
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `drivers`;
CREATE TABLE `drivers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL UNIQUE,
  `vehicle_type` VARCHAR(50) DEFAULT 'motorcycle',
  `plate_number` VARCHAR(50) NULL,
  `current_latitude` DECIMAL(10,8) NULL,
  `current_longitude` DECIMAL(11,8) NULL,
  `is_available` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_driver_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_driver_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_driver_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 22. deliveries: Delivery Assignments & GPS Tracking
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `deliveries`;
CREATE TABLE `deliveries` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT UNSIGNED NOT NULL UNIQUE,
  `driver_id` INT UNSIGNED NOT NULL,
  `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `picked_up_at` DATETIME NULL,
  `delivered_at` DATETIME NULL,
  `estimated_minutes` INT DEFAULT 25,
  `distance_km` DECIMAL(6,2) NULL,
  `status` ENUM('assigned', 'picked_up', 'in_transit', 'delivered', 'failed') DEFAULT 'assigned',
  INDEX `idx_deliv_driver` (`driver_id`),
  CONSTRAINT `fk_deliv_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_deliv_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 23. reservations: Dining Table Bookings
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `reservations`;
CREATE TABLE `reservations` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NOT NULL,
  `table_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(30) NOT NULL,
  `guest_count` INT NOT NULL DEFAULT 2,
  `reservation_date` DATE NOT NULL,
  `reservation_time` TIME NOT NULL,
  `special_requests` TEXT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_res_restaurant` (`restaurant_id`),
  INDEX `idx_res_branch` (`branch_id`),
  CONSTRAINT `fk_res_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_res_table` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 24. reviews: Customer Ratings & Feedback (with admin approval)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `customer_id` INT UNSIGNED NULL,
  `customer_name` VARCHAR(150) NOT NULL,
  `rating` TINYINT UNSIGNED NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NULL,
  `photo_url` VARCHAR(500) NULL,
  `is_approved` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rev_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_rev_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 25. coupons: Discount Codes
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `coupons`;
CREATE TABLE `coupons` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `code` VARCHAR(50) NOT NULL,
  `discount_type` ENUM('fixed', 'percentage') DEFAULT 'percentage',
  `discount_value` DECIMAL(10,2) NOT NULL,
  `min_order_amount` DECIMAL(10,2) DEFAULT 0.00,
  `max_discount_cap` DECIMAL(10,2) NULL,
  `usage_limit` INT DEFAULT 100,
  `times_used` INT DEFAULT 0,
  `starts_at` DATETIME NULL,
  `expires_at` DATETIME NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_coupon_code` (`restaurant_id`, `code`),
  CONSTRAINT `fk_coupon_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 26. offers: Promotional Campaigns & Branch/Category Discounts
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `offers`;
CREATE TABLE `offers` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `branch_id` INT UNSIGNED NULL,
  `category_id` INT UNSIGNED NULL,
  `product_id` INT UNSIGNED NULL,
  `title_ar` VARCHAR(200) NOT NULL,
  `title_en` VARCHAR(200) NOT NULL,
  `discount_percentage` DECIMAL(5,2) NOT NULL,
  `banner_image` VARCHAR(500) NULL,
  `starts_at` DATETIME NOT NULL,
  `ends_at` DATETIME NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_offer_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 27. loyalty_points: Points Ledger per Customer
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `loyalty_points`;
CREATE TABLE `loyalty_points` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT UNSIGNED NOT NULL,
  `order_id` INT UNSIGNED NULL,
  `points` INT NOT NULL,
  `action` ENUM('earned', 'redeemed', 'adjusted', 'expired') DEFAULT 'earned',
  `note` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_lp_customer` (`customer_id`),
  CONSTRAINT `fk_lp_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lp_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 28. notifications: Multi-Channel Alerts (Email, SMS, WhatsApp, Telegram, Push)
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `restaurant_id` INT UNSIGNED NOT NULL,
  `channel` ENUM('email', 'sms', 'whatsapp', 'telegram', 'push', 'system') DEFAULT 'system',
  `recipient` VARCHAR(200) NOT NULL,
  `event` ENUM('new_order', 'order_status', 'new_reservation', 'subscription_expiry', 'promo') NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `status` ENUM('pending', 'sent', 'failed') DEFAULT 'sent',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notif_restaurant` (`restaurant_id`),
  CONSTRAINT `fk_notif_restaurant` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 29. activity_logs: Complete Audit Trail & Security Log
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `activity_logs`;
CREATE TABLE `activity_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT UNSIGNED NULL,
  `restaurant_id` INT UNSIGNED NULL,
  `action` VARCHAR(100) NOT NULL,
  `description` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_log_user` (`user_id`),
  INDEX `idx_log_rest` (`restaurant_id`),
  INDEX `idx_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
-- SEED INITIAL SYSTEM DATA (Roles, Plans, Super Admin, Demo Restaurant)
-- =====================================================================

INSERT INTO `roles` (`id`, `name`, `display_name_ar`, `display_name_en`, `description`) VALUES
(1, 'super_admin', 'مدير النظام العام', 'Super Admin', 'Full SaaS platform administrative control'),
(2, 'restaurant_owner', 'مالك المطعم', 'Restaurant Owner', 'Full control over restaurant branches, menu, staff, and finances'),
(3, 'branch_manager', 'مدير الفرع', 'Branch Manager', 'Manages branch orders, tables, reservations, and inventory'),
(4, 'cashier', 'كاشير (POS)', 'Cashier', 'POS operator, sales invoices, receipts, and order intake'),
(5, 'kitchen', 'مستخدم المطبخ (KDS)', 'Kitchen Staff', 'Kitchen display system operator and ticket bumping'),
(6, 'driver', 'مندوب التوصيل', 'Delivery Driver', 'GPS routing, mobile delivery dispatch, and order completion'),
(7, 'customer', 'زبون / عميل', 'Customer', 'Browses digital QR menu, places orders, reservations, reviews');

INSERT INTO `plans` (`id`, `name_ar`, `name_en`, `slug`, `price_monthly`, `price_yearly`, `currency`, `max_branches`, `max_tables`, `max_products`, `has_pos`, `has_kds`, `has_delivery_gps`, `has_ai_analytics`, `has_custom_domain`) VALUES
(1, 'الباقة المجانية (الأساسية)', 'Free Starter Plan', 'free', 0.00, 0.00, 'USD', 1, 10, 50, 0, 0, 0, 0, 0),
(2, 'الباقة الاحترافية (Pro)', 'Professional Plan', 'pro', 49.00, 490.00, 'USD', 3, 50, 300, 1, 1, 0, 1, 0),
(3, 'الباقة المؤسسية (Enterprise)', 'Enterprise Multi-Branch', 'enterprise', 119.00, 1190.00, 'USD', 99, 500, 2000, 1, 1, 1, 1, 1);

INSERT INTO `system_settings` (`key`, `value`, `group`, `is_public`) VALUES
('platform_name', 'Sufrah SaaS Restaurant Cloud', 'general', 1),
('default_currency', 'USD', 'billing', 1),
('supported_currencies', '["USD", "IQD", "SAR", "AED"]', 'billing', 1),
('smtp_host', 'smtp.sendgrid.net', 'email', 0),
('jwt_secret_key', 'sufrah_enterprise_jwt_ultra_secret_key_2026', 'security', 0);
