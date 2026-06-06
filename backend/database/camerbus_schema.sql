-- ============================================================
-- CamerBus — Complete MySQL Schema
-- Cameroon Nationwide Bus Booking & Logistics Platform
-- Version: 1.0.0 | MySQL 8+
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+01:00"; -- WAT (West Africa Time)

CREATE DATABASE IF NOT EXISTS `camerbus` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `camerbus`;

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`       VARCHAR(150) NOT NULL,
  `email`           VARCHAR(180) UNIQUE,
  `phone`           VARCHAR(25)  NOT NULL UNIQUE,
  `password_hash`   VARCHAR(255) NOT NULL,
  `avatar_url`      VARCHAR(500),
  `language`        ENUM('en','fr') NOT NULL DEFAULT 'fr',
  `fcm_token`       VARCHAR(500),
  `is_verified`     TINYINT(1) NOT NULL DEFAULT 0,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_users_phone` (`phone`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: admins
-- ============================================================
CREATE TABLE IF NOT EXISTS `admins` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name`       VARCHAR(150) NOT NULL,
  `email`           VARCHAR(180) NOT NULL UNIQUE,
  `password_hash`   VARCHAR(255) NOT NULL,
  `role`            ENUM('super_admin','company_admin','branch_admin') NOT NULL,
  `company_id`      BIGINT UNSIGNED NULL,
  `branch_id`       BIGINT UNSIGNED NULL,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `fcm_token`       VARCHAR(500),
  `last_login`      TIMESTAMP NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_admins_role` (`role`),
  INDEX `idx_admins_company` (`company_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: companies
-- ============================================================
CREATE TABLE IF NOT EXISTS `companies` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`            VARCHAR(150) NOT NULL,
  `slug`            VARCHAR(150) NOT NULL UNIQUE,
  `description`     TEXT,
  `logo_url`        VARCHAR(500),
  `banner_url`      VARCHAR(500),
  `hq_city`         VARCHAR(100),
  `phone`           VARCHAR(25),
  `email`           VARCHAR(180),
  `website`         VARCHAR(255),
  `rating`          DECIMAL(2,1) DEFAULT 4.0,
  `total_reviews`   INT UNSIGNED DEFAULT 0,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `is_verified`     TINYINT(1) NOT NULL DEFAULT 1,
  -- Bus fleet class: 'vip' companies ONLY operate VIP/Luxury buses,
  -- 'standard' companies ONLY operate Standard/Coaster/Minibus buses.
  -- This prevents mixing bus classes within one company.
  `company_class`   ENUM('vip','standard') NOT NULL DEFAULT 'standard',
  -- Payment Details
  `mtn_name`        VARCHAR(150),
  `mtn_number`      VARCHAR(25),
  `orange_name`     VARCHAR(150),
  `orange_number`   VARCHAR(25),
  `bank_name`       VARCHAR(150),
  `bank_account`    VARCHAR(50),
  `bank_account_name` VARCHAR(150),
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_companies_active` (`is_active`),
  INDEX `idx_companies_slug` (`slug`),
  INDEX `idx_companies_class` (`company_class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: cities
-- ============================================================
CREATE TABLE IF NOT EXISTS `cities` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`            VARCHAR(100) NOT NULL,
  `name_fr`         VARCHAR(100),
  `region`          VARCHAR(100),
  `latitude`        DECIMAL(10,7),
  `longitude`       DECIMAL(10,7),
  `is_major`        TINYINT(1) DEFAULT 0,
  INDEX `idx_cities_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: branches
-- ============================================================
CREATE TABLE IF NOT EXISTS `branches` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`      BIGINT UNSIGNED NOT NULL,
  `city_id`         BIGINT UNSIGNED NOT NULL,
  `name`            VARCHAR(150) NOT NULL,
  `address`         TEXT,
  `phone`           VARCHAR(25),
  `latitude`        DECIMAL(10,7),
  `longitude`       DECIMAL(10,7),
  `opening_time`    TIME DEFAULT '05:00:00',
  `closing_time`    TIME DEFAULT '22:00:00',
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_branches_company` (`company_id`),
  INDEX `idx_branches_city` (`city_id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`city_id`) REFERENCES `cities`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: buses
-- ============================================================
CREATE TABLE IF NOT EXISTS `buses` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`      BIGINT UNSIGNED NOT NULL,
  `branch_id`       BIGINT UNSIGNED NULL,
  `plate_number`    VARCHAR(20) NOT NULL UNIQUE,
  `bus_signature`   VARCHAR(50) NULL,
  `name`            VARCHAR(100),
  `bus_type`        ENUM('VIP','Standard','Luxury','Coaster','Minibus') NOT NULL DEFAULT 'Standard',
  `total_seats`     TINYINT UNSIGNED NOT NULL DEFAULT 70,
  `amenities`       JSON,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_buses_company` (`company_id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: routes
-- ============================================================
CREATE TABLE IF NOT EXISTS `routes` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `company_id`      BIGINT UNSIGNED NOT NULL,
  `origin_city_id`  BIGINT UNSIGNED NOT NULL,
  `dest_city_id`    BIGINT UNSIGNED NOT NULL,
  `distance_km`     INT UNSIGNED,
  `price_standard`  DECIMAL(10,2) NOT NULL,
  `price_vip`       DECIMAL(10,2) NOT NULL,
  `price_luxury`    DECIMAL(10,2),
  `estimated_duration_minutes` INT UNSIGNED,
  `is_active`       TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_routes_company` (`company_id`),
  INDEX `idx_routes_cities` (`origin_city_id`, `dest_city_id`),
  UNIQUE KEY `uq_company_route` (`company_id`, `origin_city_id`, `dest_city_id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`origin_city_id`) REFERENCES `cities`(`id`),
  FOREIGN KEY (`dest_city_id`) REFERENCES `cities`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: schedules
-- ============================================================
CREATE TABLE IF NOT EXISTS `schedules` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `route_id`        BIGINT UNSIGNED NOT NULL,
  `bus_id`          BIGINT UNSIGNED NOT NULL,
  `origin_branch_id`  BIGINT UNSIGNED NOT NULL,
  `dest_branch_id`    BIGINT UNSIGNED NOT NULL,
  `travel_date`     DATE NOT NULL,
  `departure_time`  TIME NOT NULL,
  `estimated_arrival_time` TIME,
  `shift`           ENUM('day','night') NOT NULL DEFAULT 'day',
  `status`          ENUM('scheduled','boarding','departed','arrived','cancelled') NOT NULL DEFAULT 'scheduled',
  `available_seats` TINYINT UNSIGNED NOT NULL DEFAULT 70,
  `booked_seats`    TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_schedules_route_date` (`route_id`, `travel_date`),
  INDEX `idx_schedules_bus` (`bus_id`),
  INDEX `idx_schedules_status` (`status`),
  FOREIGN KEY (`route_id`) REFERENCES `routes`(`id`),
  FOREIGN KEY (`bus_id`) REFERENCES `buses`(`id`),
  FOREIGN KEY (`origin_branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`dest_branch_id`) REFERENCES `branches`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: seats
-- ============================================================
CREATE TABLE IF NOT EXISTS `seats` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `bus_id`          BIGINT UNSIGNED NOT NULL,
  `seat_number`     VARCHAR(10) NOT NULL,
  `row_number`      TINYINT UNSIGNED NOT NULL,
  `seat_position`   ENUM('window_left','middle','window_right','aisle_left','aisle_right') DEFAULT 'window_left',
  `seat_type`       ENUM('standard','vip','driver') NOT NULL DEFAULT 'standard',
  INDEX `idx_seats_bus` (`bus_id`),
  UNIQUE KEY `uq_bus_seat` (`bus_id`, `seat_number`),
  FOREIGN KEY (`bus_id`) REFERENCES `buses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: bookings
-- ============================================================
CREATE TABLE IF NOT EXISTS `bookings` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_ref`     VARCHAR(30) NOT NULL UNIQUE,
  `user_id`         BIGINT UNSIGNED NOT NULL,
  `schedule_id`     BIGINT UNSIGNED NOT NULL,
  `total_amount`    DECIMAL(10,2) NOT NULL,
  `passenger_count` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `status`          ENUM('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
  `notes`           TEXT,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_bookings_user` (`user_id`),
  INDEX `idx_bookings_schedule` (`schedule_id`),
  INDEX `idx_bookings_ref` (`booking_ref`),
  INDEX `idx_bookings_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: booking_seats
-- ============================================================
CREATE TABLE IF NOT EXISTS `booking_seats` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id`      BIGINT UNSIGNED NOT NULL,
  `seat_id`         BIGINT UNSIGNED NOT NULL,
  `schedule_id`     BIGINT UNSIGNED NOT NULL,
  `passenger_name`  VARCHAR(150),
  `passenger_id_no` VARCHAR(50),
  `emergency_contact` VARCHAR(50) NULL,
  `is_held`         TINYINT(1) DEFAULT 0,
  `held_until`      TIMESTAMP NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_schedule_seat` (`schedule_id`, `seat_id`),
  INDEX `idx_booking_seats_booking` (`booking_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`seat_id`) REFERENCES `seats`(`id`),
  FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS `payments` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `booking_id`      BIGINT UNSIGNED NOT NULL UNIQUE,
  `amount`          DECIMAL(10,2) NOT NULL,
  `method`          ENUM('mtn_momo','orange_money','bank_transfer') NOT NULL,
  `status`          ENUM('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
  `transaction_ref` VARCHAR(100),
  `payer_name`      VARCHAR(150),
  `payer_phone`     VARCHAR(25),
  `notes`           TEXT,
  `approved_by`     BIGINT UNSIGNED NULL,
  `approved_at`     TIMESTAMP NULL,
  `rejected_reason` VARCHAR(500),
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_payments_status` (`status`),
  INDEX `idx_payments_booking` (`booking_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`),
  FOREIGN KEY (`approved_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: payment_receipts
-- ============================================================
CREATE TABLE IF NOT EXISTS `payment_receipts` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `payment_id`      BIGINT UNSIGNED NOT NULL,
  `file_path`       VARCHAR(500) NOT NULL,
  `file_type`       VARCHAR(50),
  `file_size`       INT UNSIGNED,
  `uploaded_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_receipts_payment` (`payment_id`),
  FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: tickets
-- ============================================================
CREATE TABLE IF NOT EXISTS `tickets` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `ticket_code`     VARCHAR(30) NOT NULL UNIQUE,
  `booking_id`      BIGINT UNSIGNED NOT NULL,
  `booking_seat_id` BIGINT UNSIGNED NOT NULL,
  `qr_payload`      TEXT NOT NULL,
  `status`          ENUM('valid','used','expired','cancelled') NOT NULL DEFAULT 'valid',
  `used_at`         TIMESTAMP NULL,
  `validated_by`    BIGINT UNSIGNED NULL,
  `issued_at`       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_tickets_code` (`ticket_code`),
  INDEX `idx_tickets_booking` (`booking_id`),
  INDEX `idx_tickets_status` (`status`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`),
  FOREIGN KEY (`validated_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: parcel_shipments
-- ============================================================
CREATE TABLE IF NOT EXISTS `parcel_shipments` (
  `id`                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `tracking_number`     VARCHAR(30) NOT NULL UNIQUE,
  `sender_id`           BIGINT UNSIGNED NULL,
  `sender_name`         VARCHAR(150) NOT NULL,
  `sender_phone`        VARCHAR(25) NOT NULL,
  `receiver_name`       VARCHAR(150) NOT NULL,
  `receiver_phone`      VARCHAR(25) NOT NULL,
  `origin_branch_id`    BIGINT UNSIGNED NOT NULL,
  `dest_branch_id`      BIGINT UNSIGNED NOT NULL,
  `company_id`          BIGINT UNSIGNED NOT NULL,
  `description`         TEXT,
  `weight_kg`           DECIMAL(6,2),
  `dimensions`          VARCHAR(100),
  `is_fragile`          TINYINT(1) DEFAULT 0,
  `declared_value`      DECIMAL(10,2),
  `shipping_cost`       DECIMAL(10,2) NOT NULL,
  `payment_method`      ENUM('mtn_momo','orange_money','bank_transfer','cash') DEFAULT 'cash',
  `payment_status`      ENUM('pending','paid') DEFAULT 'pending',
  `status`              ENUM('received','in_transit','arrived','ready_for_pickup','collected','returned') NOT NULL DEFAULT 'received',
  `notes`               TEXT,
  `created_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_parcels_tracking` (`tracking_number`),
  INDEX `idx_parcels_sender` (`sender_id`),
  INDEX `idx_parcels_company` (`company_id`),
  INDEX `idx_parcels_status` (`status`),
  FOREIGN KEY (`origin_branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`dest_branch_id`) REFERENCES `branches`(`id`),
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: parcel_tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS `parcel_tracking` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `parcel_id`       BIGINT UNSIGNED NOT NULL,
  `status`          ENUM('received','in_transit','arrived','ready_for_pickup','collected','returned') NOT NULL,
  `location`        VARCHAR(200),
  `description`     VARCHAR(500),
  `updated_by`      BIGINT UNSIGNED NULL,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_parcel_tracking_parcel` (`parcel_id`),
  FOREIGN KEY (`parcel_id`) REFERENCES `parcel_shipments`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`updated_by`) REFERENCES `admins`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id`              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id`         BIGINT UNSIGNED NULL,
  `admin_id`        BIGINT UNSIGNED NULL,
  `type`            ENUM('booking_confirmed','payment_approved','payment_rejected','departure_reminder','parcel_update','ticket_ready','general') NOT NULL,
  `title`           VARCHAR(255) NOT NULL,
  `title_fr`        VARCHAR(255),
  `body`            TEXT NOT NULL,
  `body_fr`         TEXT,
  `data`            JSON,
  `is_read`         TINYINT(1) DEFAULT 0,
  `sent_via_fcm`    TINYINT(1) DEFAULT 0,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`),
  INDEX `idx_notifications_read` (`is_read`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Add FK constraints for admins (circular dependency resolved)
-- ============================================================
ALTER TABLE `admins`
  ADD CONSTRAINT `fk_admins_company` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_admins_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON DELETE SET NULL;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VIEWS
-- ============================================================
CREATE OR REPLACE VIEW `v_active_schedules` AS
SELECT 
  s.id, s.travel_date, s.departure_time, s.shift, s.status,
  s.available_seats, s.booked_seats,
  r.price_standard, r.price_vip, r.distance_km, r.estimated_duration_minutes,
  c.id AS company_id, c.name AS company_name, c.logo_url, c.rating,
  oc.name AS origin_city, dc.name AS dest_city,
  ob.name AS origin_branch, db.name AS dest_branch,
  b.plate_number, b.bus_type, b.total_seats
FROM schedules s
JOIN routes r ON s.route_id = r.id
JOIN companies c ON r.company_id = c.id
JOIN cities oc ON r.origin_city_id = oc.id
JOIN cities dc ON r.dest_city_id = dc.id
JOIN branches ob ON s.origin_branch_id = ob.id
JOIN branches db ON s.dest_branch_id = db.id
JOIN buses b ON s.bus_id = b.id
WHERE s.status NOT IN ('cancelled', 'arrived')
  AND c.is_active = 1
  AND r.is_active = 1;
