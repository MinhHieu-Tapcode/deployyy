CREATE DATABASE IF NOT EXISTS `lau_nam_gia_khanh` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lau_nam_gia_khanh`;

-- 1. employees
CREATE TABLE IF NOT EXISTS `employees` (
  `id` VARCHAR(50) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(100) NOT NULL,
  `role` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. dining_tables
CREATE TABLE IF NOT EXISTS `dining_tables` (
  `id` VARCHAR(50) NOT NULL,
  `floor` INT NOT NULL,
  `capacity` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. categories
CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `sort_order` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. dishes
CREATE TABLE IF NOT EXISTS `dishes` (
  `id` VARCHAR(50) NOT NULL,
  `category_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `description` TEXT,
  `image_url` LONGTEXT,
  `status` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. recipe_items
CREATE TABLE IF NOT EXISTS `recipe_items` (
  `dish_id` VARCHAR(50) NOT NULL,
  `material_id` VARCHAR(50) NOT NULL,
  `quantity` DECIMAL(12,2) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`dish_id`, `material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. raw_materials
CREATE TABLE IF NOT EXISTS `raw_materials` (
  `id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `unit` VARCHAR(20) NOT NULL,
  `stock_current` DECIMAL(12,2) NOT NULL,
  `stock_min` DECIMAL(12,2) NOT NULL,
  `stock_max` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. table_sessions
CREATE TABLE IF NOT EXISTS `table_sessions` (
  `id` VARCHAR(50) NOT NULL,
  `table_id` VARCHAR(50) NOT NULL,
  `customer_id` VARCHAR(50) DEFAULT NULL,
  `start_time` VARCHAR(50) NOT NULL,
  `end_time` VARCHAR(50) DEFAULT NULL,
  `share_code` VARCHAR(20) NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `guests_count` INT NOT NULL DEFAULT 4,
  `customer_phone` VARCHAR(20) DEFAULT NULL,
  `created_by` VARCHAR(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. orders
CREATE TABLE IF NOT EXISTS `orders` (
  `id` VARCHAR(50) NOT NULL,
  `session_id` VARCHAR(50) NOT NULL,
  `created_at` VARCHAR(50) NOT NULL,
  `service_status` VARCHAR(50) NOT NULL,
  `total_amount` DECIMAL(12,2) NOT NULL,
  `invoice_image` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. order_details
CREATE TABLE IF NOT EXISTS `order_details` (
  `id` VARCHAR(50) NOT NULL,
  `order_id` VARCHAR(50) NOT NULL,
  `dish_id` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL,
  `price_at_time` DECIMAL(12,2) NOT NULL,
  `item_status` VARCHAR(50) NOT NULL,
  `notes` TEXT,
  `ordered_at` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. import_receipts
CREATE TABLE IF NOT EXISTS `import_receipts` (
  `id` VARCHAR(50) NOT NULL,
  `date_received` VARCHAR(50) NOT NULL,
  `shipper_name` VARCHAR(200) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `employee_name` VARCHAR(100) NOT NULL,
  `notes` TEXT,
  `total_value` DECIMAL(12,2) NOT NULL,
  `receipt_image` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. import_receipt_details
CREATE TABLE IF NOT EXISTS `import_receipt_details` (
  `receipt_id` VARCHAR(50) NOT NULL,
  `material_id` VARCHAR(50) NOT NULL,
  `quantity_received` DECIMAL(12,2) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`receipt_id`, `material_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. system_logs
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` VARCHAR(50) NOT NULL,
  `employee_id` VARCHAR(50) NOT NULL,
  `employee_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(200) NOT NULL,
  `created_at` VARCHAR(50) NOT NULL,
  `changed_data` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. table_reservations
CREATE TABLE IF NOT EXISTS `table_reservations` (
  `id` VARCHAR(50) NOT NULL,
  `table_id` VARCHAR(50) NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `reservation_date` VARCHAR(50) NOT NULL,
  `reservation_time` VARCHAR(20) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. inventory_transactions
CREATE TABLE IF NOT EXISTS `inventory_transactions` (
  `id` VARCHAR(50) NOT NULL,
  `material_id` VARCHAR(50) NOT NULL,
  `transaction_type` VARCHAR(20) NOT NULL,
  `quantity` DECIMAL(12,2) NOT NULL,
  `created_at` VARCHAR(50) NOT NULL,
  `reference_id` VARCHAR(50) NOT NULL,
  `notes` TEXT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
