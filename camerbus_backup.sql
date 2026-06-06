-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: camerbus
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `admins` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('super_admin','company_admin','branch_admin') NOT NULL,
  `company_id` bigint(20) unsigned DEFAULT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `fcm_token` varchar(500) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_admins_role` (`role`),
  KEY `idx_admins_company` (`company_id`),
  KEY `fk_admins_branch` (`branch_id`),
  CONSTRAINT `fk_admins_branch` FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_admins_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'Super Administrator','admin@camerbus.cm','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.','super_admin',NULL,NULL,1,NULL,NULL,'2026-05-25 11:35:16','2026-05-25 11:35:16',NULL),(2,'Nso Boyz Admin','admin@nsoboyz.cm','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.','company_admin',1,NULL,1,NULL,NULL,'2026-05-25 11:35:16','2026-05-25 11:35:16',NULL),(3,'Vatican Admin','admin@vaticanexpress.cm','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.','company_admin',2,NULL,1,NULL,NULL,'2026-05-25 11:35:16','2026-05-25 11:35:16',NULL),(4,'Mile 4 Branch Admin','branch1@nsoboyz.cm','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.','branch_admin',1,1,1,NULL,NULL,'2026-05-25 11:35:16','2026-05-25 11:35:16',NULL);
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `booking_seats`
--

DROP TABLE IF EXISTS `booking_seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `booking_seats` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `seat_id` bigint(20) unsigned NOT NULL,
  `schedule_id` bigint(20) unsigned NOT NULL,
  `passenger_name` varchar(150) DEFAULT NULL,
  `passenger_id_no` varchar(50) DEFAULT NULL,
  `is_held` tinyint(1) DEFAULT 0,
  `held_until` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_schedule_seat` (`schedule_id`,`seat_id`),
  KEY `idx_booking_seats_booking` (`booking_id`),
  KEY `seat_id` (`seat_id`),
  CONSTRAINT `booking_seats_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `booking_seats_ibfk_2` FOREIGN KEY (`seat_id`) REFERENCES `seats` (`id`),
  CONSTRAINT `booking_seats_ibfk_3` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `booking_seats`
--

LOCK TABLES `booking_seats` WRITE;
/*!40000 ALTER TABLE `booking_seats` DISABLE KEYS */;
INSERT INTO `booking_seats` VALUES (1,1,7,6,'Mbo Peter ',NULL,1,'2026-05-25 21:40:03','2026-05-25 12:25:03'),(2,2,3,6,'Mbo Peter ',NULL,1,'2026-05-25 21:40:26','2026-05-25 12:25:26');
/*!40000 ALTER TABLE `booking_seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bookings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_ref` varchar(30) NOT NULL,
  `user_id` bigint(20) unsigned NOT NULL,
  `schedule_id` bigint(20) unsigned NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `passenger_count` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `status` enum('pending','confirmed','cancelled','completed','no_show') NOT NULL DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_ref` (`booking_ref`),
  KEY `idx_bookings_user` (`user_id`),
  KEY `idx_bookings_schedule` (`schedule_id`),
  KEY `idx_bookings_ref` (`booking_ref`),
  KEY `idx_bookings_status` (`status`),
  CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings`
--

LOCK TABLES `bookings` WRITE;
/*!40000 ALTER TABLE `bookings` DISABLE KEYS */;
INSERT INTO `bookings` VALUES (1,'BK-20260525-BCD4A9',1,6,6500.00,1,'pending',NULL,'2026-05-25 12:25:03','2026-05-25 12:25:03',NULL),(2,'BK-20260525-263525',1,6,6500.00,1,'pending',NULL,'2026-05-25 12:25:26','2026-05-25 12:25:26',NULL);
/*!40000 ALTER TABLE `bookings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `branches`
--

DROP TABLE IF EXISTS `branches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `branches` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) unsigned NOT NULL,
  `city_id` bigint(20) unsigned NOT NULL,
  `name` varchar(150) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `opening_time` time DEFAULT '05:00:00',
  `closing_time` time DEFAULT '22:00:00',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_branches_company` (`company_id`),
  KEY `idx_branches_city` (`city_id`),
  CONSTRAINT `branches_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `branches_ibfk_2` FOREIGN KEY (`city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `branches`
--

LOCK TABLES `branches` WRITE;
/*!40000 ALTER TABLE `branches` DISABLE KEYS */;
INSERT INTO `branches` VALUES (1,1,3,'Mile 4 - Bamenda','Mile 4 Nkwen, Bamenda','677111001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(2,1,3,'Bambui - Bamenda','Bambui Junction, Bamenda','677111002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(3,1,3,'City Chemist - Bamenda','City Chemist, Bamenda','677111003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(4,1,2,'Bonaberi - Douala','Bonaberi Terminal, Douala','677111004',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(5,1,2,'Akwa - Douala','Akwa, Bonanjo Road, Douala','677111005',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(6,1,1,'Biyem-Assi - Yaoundé','Biyem-Assi Carrefour, Yaoundé','677111006',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(7,1,1,'Mvan - Yaoundé','Mvan Terminal, Yaoundé','677111007',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(8,2,2,'Bonaberi - Douala','Bonaberi, Douala','699222001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(9,2,2,'Deido - Douala','Deido Quarter, Douala','699222002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(10,2,1,'Biyem-Assi - Yaoundé','Biyem-Assi, Yaoundé','699222003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(11,2,1,'Mvan - Yaoundé','Mvan, Yaoundé','699222004',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(12,2,3,'City Chemist - Bamenda','City Chemist, Bamenda','699222005',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(13,3,1,'Biscuiterie - Yaoundé','Biscuiterie, Yaoundé','677333001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(14,3,1,'Mvan - Yaoundé','Mvan Terminal, Yaoundé','677333002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(15,3,2,'Akwa - Douala','Akwa, Douala','677333003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(16,3,2,'Bonaberi - Douala','Bonaberi, Douala','677333004',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(17,3,3,'Mile 4 - Bamenda','Mile 4 Nkwen, Bamenda','677333005',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(18,3,5,'Buea Town','Buea Town Park, Buea','677333006',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(19,4,2,'Bonaberi - Douala','Bonaberi Terminal, Douala','699444001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(20,4,2,'Bépanda - Douala','Bépanda, Douala','699444002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(21,4,3,'Bambui - Bamenda','Bambui Junction, Bamenda','699444003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(22,4,1,'Biyem-Assi - Yaoundé','Biyem-Assi, Yaoundé','699444004',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(23,5,1,'Biscuiterie - Yaoundé','Biscuiterie, Yaoundé','677555001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(24,5,1,'Mvan - Yaoundé','Mvan, Yaoundé','677555002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(25,5,2,'Akwa - Douala','Akwa, Douala','677555003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(26,5,5,'Buea Town','Buea Town, Buea','677555004',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(27,5,4,'Bafoussam Marché','Grand Marché, Bafoussam','677555005',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(28,6,3,'Mile 4 - Bamenda','Mile 4 Nkwen, Bamenda','677666001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(29,6,2,'Bonaberi - Douala','Bonaberi, Douala','677666002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(30,6,1,'Biyem-Assi - Yaoundé','Biyem-Assi, Yaoundé','677666003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(31,7,3,'City Chemist - Bamenda','City Chemist, Bamenda','699777001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(32,7,1,'Mvan - Yaoundé','Mvan, Yaoundé','699777002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(33,8,4,'Bafoussam Centre','Centre-ville, Bafoussam','677888001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(34,8,2,'Deido - Douala','Deido, Douala','677888002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(35,8,1,'Biyem-Assi - Yaoundé','Biyem-Assi, Yaoundé','677888003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(36,9,2,'Bonaberi - Douala','Bonaberi Terminal, Douala','677999001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(37,9,2,'Akwa - Douala','Akwa, Douala','677999002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(38,9,1,'Mvan - Yaoundé','Mvan, Yaoundé','677999003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(39,9,5,'Buea Town','Buea Town, Buea','677999004',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(40,9,6,'Limbe Motor Park','Motor Park, Limbe','677999005',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(41,10,1,'Biscuiterie - Yaoundé','Biscuiterie, Yaoundé','699010001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(42,10,2,'Akwa - Douala','Akwa, Douala','699010002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(43,10,7,'Ngaoundéré Gare','Gare Routière, Ngaoundéré','699010003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(44,11,10,'Kumba Motor Park','Motor Park, Kumba','677011001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(45,11,2,'Bonaberi - Douala','Bonaberi, Douala','677011002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(46,11,5,'Buea Town','Buea Town, Buea','677011003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(47,12,4,'Bafoussam Centre','Centre-ville, Bafoussam','699012001',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(48,12,3,'Mile 4 - Bamenda','Mile 4 Nkwen, Bamenda','699012002',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(49,12,1,'Biyem-Assi - Yaoundé','Biyem-Assi, Yaoundé','699012003',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-25 11:35:15','2026-05-25 11:35:15'),(50,3,6,'Half Mile - Limbe','Half Mile Limbe','677000000',NULL,NULL,'05:00:00','22:00:00',1,'2026-05-26 04:14:45','2026-05-26 04:14:45');
/*!40000 ALTER TABLE `branches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `buses`
--

DROP TABLE IF EXISTS `buses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `buses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) unsigned NOT NULL,
  `branch_id` bigint(20) unsigned DEFAULT NULL,
  `plate_number` varchar(20) NOT NULL,
  `bus_signature` varchar(20) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `bus_type` enum('VIP','Standard','Luxury','Coaster','Minibus') NOT NULL DEFAULT 'Standard',
  `total_seats` tinyint(3) unsigned NOT NULL DEFAULT 70,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_faulty` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plate_number` (`plate_number`),
  UNIQUE KEY `uq_bus_signature` (`bus_signature`),
  KEY `idx_buses_company` (`company_id`),
  CONSTRAINT `buses_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `buses`
--

LOCK TABLES `buses` WRITE;
/*!40000 ALTER TABLE `buses` DISABLE KEYS */;
INSERT INTO `buses` VALUES (1,1,1,'NW-0101-BN','NSO-STD-01','Nso Star 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(2,1,1,'NW-0102-BN','NSO-VIP-01','Nso Star 2','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(3,1,2,'NW-0103-BN','NSO-CST-01','Nso Coaster 1','Coaster',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(4,2,8,'LT-0201-DL','VAT-STD-01','Vatican 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(5,2,8,'LT-0202-DL','VAT-VIP-01','Vatican VIP','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(6,3,13,'CE-0301-YD','TRX-LUX-01','Touristique 1','Luxury',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(7,3,13,'CE-0302-YD','TRX-STD-01','Touristique 2','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(8,3,15,'LT-0303-DL','TRX-VIP-01','Touristique 3','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(9,4,19,'LT-0401-DL','GRT-STD-01','Garanti 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(10,4,19,'LT-0402-DL','GRT-STD-02','Garanti 2','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(11,5,23,'CE-0501-YD','GEN-VIP-01','General VIP 1','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(12,5,23,'CE-0502-YD','GEN-STD-01','General STD 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(13,6,28,'NW-0601-BN','FNX-STD-01','Finexs 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(14,6,28,'NW-0602-BN','FNX-VIP-01','Finexs VIP','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(15,7,31,'NW-0701-BN','MGH-STD-01','Moghamo 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(16,8,33,'OU-0801-BF','MUS-STD-01','Musango 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(17,8,33,'OU-0802-BF','MUS-VIP-01','Musango VIP','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(18,9,36,'LT-0901-DL','UNT-STD-01','United 1','Standard',30,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(19,9,36,'LT-0902-DL','UNT-VIP-01','United VIP','VIP',30,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(20,9,37,'LT-0903-DL','UNT-LUX-01','United 3','Luxury',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(21,10,41,'CE-1001-YD','OAS-LUX-01','Oasis Luxury 1','Luxury',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(22,10,41,'CE-1002-YD','OAS-VIP-01','Oasis VIP 1','VIP',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(23,11,44,'SW-1101-KM','AFL-STD-01','Afrique Lan 1','Standard',70,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(24,12,47,'OU-1201-BF','AMZ-STD-01','Amour Mezam 1','Standard',30,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35'),(25,12,47,'OU-1202-BF','AMZ-VIP-01','Amour Mezam VIP','VIP',30,NULL,1,0,'2026-05-25 11:35:16','2026-05-26 07:22:35');
/*!40000 ALTER TABLE `buses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cities`
--

DROP TABLE IF EXISTS `cities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `name_fr` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_major` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_cities_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cities`
--

LOCK TABLES `cities` WRITE;
/*!40000 ALTER TABLE `cities` DISABLE KEYS */;
INSERT INTO `cities` VALUES (1,'Yaoundé','Yaoundé','Centre',3.8480000,11.5021000,1),(2,'Douala','Douala','Littoral',4.0511000,9.7679000,1),(3,'Bamenda','Bamenda','North West',5.9631000,10.1591000,1),(4,'Bafoussam','Bafoussam','West',5.4737000,10.4172000,1),(5,'Buea','Buea','South West',4.1527000,9.2418000,1),(6,'Limbe','Limbé','South West',4.0229000,9.2019000,1),(7,'Ngaoundéré','Ngaoundéré','Adamawa',7.3267000,13.5839000,1),(8,'Garoua','Garoua','North',9.3008000,13.3964000,1),(9,'Maroua','Maroua','Far North',10.5908000,14.3240000,1),(10,'Kumba','Kumba','South West',4.6366000,9.4468000,1),(11,'Ebolowa','Ebolowa','South',2.9000000,11.1500000,0),(12,'Bertoua','Bertoua','East',4.5833000,13.6833000,0),(13,'Kribi','Kribi','South',2.9396000,9.9073000,0),(14,'Nkongsamba','Nkongsamba','Littoral',4.9527000,9.9388000,0),(15,'Dschang','Dschang','West',5.4453000,10.0553000,0),(16,'Mbalmayo','Mbalmayo','Centre',3.5167000,11.5000000,0),(17,'Edéa','Edéa','Littoral',3.7993000,10.1302000,0),(18,'Foumban','Foumban','West',5.7261000,10.9108000,0),(19,'Sangmélima','Sangmélima','South',2.9333000,11.9833000,0),(20,'Tibati','Tibati','Adamawa',6.4667000,12.6333000,0);
/*!40000 ALTER TABLE `cities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `companies` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `banner_url` varchar(500) DEFAULT NULL,
  `hq_city` varchar(100) DEFAULT NULL,
  `phone` varchar(25) DEFAULT NULL,
  `email` varchar(180) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 4.0,
  `total_reviews` int(10) unsigned DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_verified` tinyint(1) NOT NULL DEFAULT 1,
  `mtn_name` varchar(150) DEFAULT NULL,
  `mtn_number` varchar(25) DEFAULT NULL,
  `orange_name` varchar(150) DEFAULT NULL,
  `orange_number` varchar(25) DEFAULT NULL,
  `bank_name` varchar(150) DEFAULT NULL,
  `bank_account` varchar(50) DEFAULT NULL,
  `bank_account_name` varchar(150) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_companies_active` (`is_active`),
  KEY `idx_companies_slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
INSERT INTO `companies` VALUES (1,'Nso Boyz Express','nso-boyz-express','Premier intercity transport connecting the North West to major Cameroon cities.',NULL,NULL,'Bamenda','677123456','info@nsoboyz.cm',NULL,4.5,312,1,1,'NSO BOYZ EXPRESS','677123456',NULL,NULL,'Afriland First Bank','10010001001','NSO BOYZ EXPRESS SARL','2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(2,'Vatican Express','vatican-express','Reliable daily trips between Douala, Yaoundé and beyond.',NULL,NULL,'Douala','699234567','info@vaticanexpress.cm',NULL,4.2,287,1,1,NULL,NULL,'VATICAN EXPRESS','699234567',NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(3,'Touristique Express','touristique-express','Comfortable VIP and Standard coaches across Cameroon since 1998.',NULL,NULL,'Yaoundé','677345678','contact@touristique.cm',NULL,4.6,541,1,1,'TOURISTIQUE EXPRESS','677345678','TOURISTIQUE EXPRESS','699345678','Ecobank Cameroun','20020002002','TOURISTIQUE EXPRESS SA','2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(4,'Garanti Express','garanti-express','Safe and affordable transport across the Littoral and North West regions.',NULL,NULL,'Douala','699456789',NULL,NULL,4.0,198,1,1,NULL,NULL,'GARANTI EXPRESS','699456789',NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(5,'Général Express','general-express','Nationwide network with modern buses and professional drivers.',NULL,NULL,'Yaoundé','677567890','info@generalexpress.cm',NULL,4.3,421,1,1,'GENERAL EXPRESS','677567890',NULL,NULL,'BICEC Cameroun','30030003003','GENERAL EXPRESS SA','2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(6,'Finexs Voyages','finexs-voyages','Specializing in Bamenda corridor routes with luxury coaches.',NULL,NULL,'Bamenda','677678901',NULL,NULL,4.1,165,1,1,'FINEXS VOYAGES','677678901',NULL,NULL,NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(7,'Moghamo Express','moghamo-express','Community-driven transport service from the heart of the North West.',NULL,NULL,'Bamenda','699789012',NULL,NULL,3.9,134,1,1,NULL,NULL,'MOGHAMO EXPRESS','699789012',NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(8,'Musango Bus Service','musango-bus-service','Connecting Bafoussam and the West region to the rest of Cameroon.',NULL,NULL,'Bafoussam','677890123',NULL,NULL,4.0,209,1,1,'MUSANGO BUS SERVICE','677890123',NULL,NULL,NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(9,'United Express','united-express','Modern fleet with multiple daily departures from Douala.',NULL,NULL,'Douala','677901234','info@unitedexpress.cm',NULL,4.4,378,1,1,'UNITED EXPRESS','677901234','UNITED EXPRESS','699901234','UBA Cameroun','40040004004','UNITED EXPRESS SARL','2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(10,'Oasis Travels','oasis-travels','Premium travel experience across Cameroon southern and central routes.',NULL,NULL,'Yaoundé','699012345','oasis@oasistravels.cm',NULL,4.7,490,1,1,NULL,NULL,'OASIS TRAVELS','699012345','Afriland First Bank','50050005005','OASIS TRAVELS SA','2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(11,'Afrique Lan Express','afrique-lan-express','South West specialist connecting Kumba, Buea and Limbe to Douala.',NULL,NULL,'Kumba','677012346',NULL,NULL,3.8,112,1,1,'AFRIQUE LAN EXPRESS','677012346',NULL,NULL,NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(12,'Amour Mezam','amour-mezam','Serving the Mezam division and connecting Bafoussam to Bamenda corridor.',NULL,NULL,'Bafoussam','699123457',NULL,NULL,4.2,267,1,1,NULL,NULL,'AMOUR MEZAM','699123457',NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(13,'Buca Express','buca-express','Fast express service on the Buea-Douala-Yaoundé triangle.',NULL,NULL,'Buea','677223344',NULL,NULL,4.1,143,1,1,'BUCA EXPRESS','677223344',NULL,NULL,NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(14,'Confort Voyages','confort-voyages','Luxury coaches with AC, WiFi and onboard entertainment.',NULL,NULL,'Yaoundé','699334455','confort@comfortvoyages.cm',NULL,4.8,623,1,1,NULL,NULL,'CONFORT VOYAGES','699334455','Societe Generale Cameroun','60060006006','CONFORT VOYAGES SA','2026-05-25 11:35:04','2026-05-25 11:35:04',NULL),(15,'Star Lines','star-lines','Northern routes specialist — Garoua, Ngaoundéré, Maroua corridors.',NULL,NULL,'Garoua','677445566',NULL,NULL,3.9,178,1,1,'STAR LINES','677445566',NULL,NULL,NULL,NULL,NULL,'2026-05-25 11:35:04','2026-05-25 11:35:04',NULL);
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `notifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `admin_id` bigint(20) unsigned DEFAULT NULL,
  `type` enum('booking_confirmed','payment_approved','payment_rejected','departure_reminder','parcel_update','ticket_ready','general') NOT NULL,
  `title` varchar(255) NOT NULL,
  `title_fr` varchar(255) DEFAULT NULL,
  `body` text NOT NULL,
  `body_fr` text DEFAULT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`data`)),
  `is_read` tinyint(1) DEFAULT 0,
  `sent_via_fcm` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  KEY `idx_notifications_read` (`is_read`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcel_shipments`
--

DROP TABLE IF EXISTS `parcel_shipments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcel_shipments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tracking_number` varchar(30) NOT NULL,
  `sender_id` bigint(20) unsigned DEFAULT NULL,
  `sender_name` varchar(150) NOT NULL,
  `sender_phone` varchar(25) NOT NULL,
  `receiver_name` varchar(150) NOT NULL,
  `receiver_phone` varchar(25) NOT NULL,
  `origin_branch_id` bigint(20) unsigned NOT NULL,
  `dest_branch_id` bigint(20) unsigned NOT NULL,
  `company_id` bigint(20) unsigned NOT NULL,
  `assigned_bus_id` bigint(20) unsigned DEFAULT NULL,
  `description` text DEFAULT NULL,
  `weight_kg` decimal(6,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `is_fragile` tinyint(1) DEFAULT 0,
  `declared_value` decimal(10,2) DEFAULT NULL,
  `shipping_cost` decimal(10,2) NOT NULL,
  `payment_method` enum('mtn_momo','orange_money','bank_transfer','cash') DEFAULT 'cash',
  `payment_status` enum('pending','paid') DEFAULT 'pending',
  `status` enum('received','in_transit','arrived','ready_for_pickup','collected','returned') NOT NULL DEFAULT 'received',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tracking_number` (`tracking_number`),
  KEY `idx_parcels_tracking` (`tracking_number`),
  KEY `idx_parcels_sender` (`sender_id`),
  KEY `idx_parcels_company` (`company_id`),
  KEY `idx_parcels_status` (`status`),
  KEY `origin_branch_id` (`origin_branch_id`),
  KEY `dest_branch_id` (`dest_branch_id`),
  KEY `assigned_bus_id` (`assigned_bus_id`),
  CONSTRAINT `parcel_shipments_ibfk_1` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `parcel_shipments_ibfk_2` FOREIGN KEY (`dest_branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `parcel_shipments_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`),
  CONSTRAINT `parcel_shipments_ibfk_4` FOREIGN KEY (`assigned_bus_id`) REFERENCES `buses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcel_shipments`
--

LOCK TABLES `parcel_shipments` WRITE;
/*!40000 ALTER TABLE `parcel_shipments` DISABLE KEYS */;
INSERT INTO `parcel_shipments` VALUES (1,'PKG260525C1ADFD',1,'Mbo Peter ','673846800','Ngu','653242520',17,15,3,NULL,'Ybgd',1.00,NULL,0,5000.00,500.00,'cash','pending','received',NULL,'2026-05-25 12:28:56','2026-05-25 12:28:56');
/*!40000 ALTER TABLE `parcel_shipments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcel_tracking`
--

DROP TABLE IF EXISTS `parcel_tracking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `parcel_tracking` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `parcel_id` bigint(20) unsigned NOT NULL,
  `status` enum('received','in_transit','arrived','ready_for_pickup','collected','returned') NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_parcel_tracking_parcel` (`parcel_id`),
  KEY `updated_by` (`updated_by`),
  CONSTRAINT `parcel_tracking_ibfk_1` FOREIGN KEY (`parcel_id`) REFERENCES `parcel_shipments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `parcel_tracking_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcel_tracking`
--

LOCK TABLES `parcel_tracking` WRITE;
/*!40000 ALTER TABLE `parcel_tracking` DISABLE KEYS */;
INSERT INTO `parcel_tracking` VALUES (1,1,'received','Mile 4 - Bamenda','Package received at origin branch',NULL,'2026-05-25 12:28:56');
/*!40000 ALTER TABLE `parcel_tracking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_receipts`
--

DROP TABLE IF EXISTS `payment_receipts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payment_receipts` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `payment_id` bigint(20) unsigned NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_type` varchar(50) DEFAULT NULL,
  `file_size` int(10) unsigned DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_receipts_payment` (`payment_id`),
  CONSTRAINT `payment_receipts_ibfk_1` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_receipts`
--

LOCK TABLES `payment_receipts` WRITE;
/*!40000 ALTER TABLE `payment_receipts` DISABLE KEYS */;
INSERT INTO `payment_receipts` VALUES (1,2,'uploads/receipts/41a46ab31368bcdace2506fd2dfae17a.jpg','image/jpeg',24984,'2026-05-25 12:26:26');
/*!40000 ALTER TABLE `payment_receipts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `payments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `booking_id` bigint(20) unsigned NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` enum('mtn_momo','orange_money','bank_transfer') NOT NULL,
  `status` enum('pending','approved','rejected','refunded') NOT NULL DEFAULT 'pending',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `payer_name` varchar(150) DEFAULT NULL,
  `payer_phone` varchar(25) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `approved_by` bigint(20) unsigned DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejected_reason` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `booking_id` (`booking_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_booking` (`booking_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,6500.00,'mtn_momo','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-25 12:25:03','2026-05-25 12:25:03'),(2,2,6500.00,'mtn_momo','pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2026-05-25 12:25:26','2026-05-25 12:25:26');
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `routes`
--

DROP TABLE IF EXISTS `routes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `routes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company_id` bigint(20) unsigned NOT NULL,
  `origin_city_id` bigint(20) unsigned NOT NULL,
  `dest_city_id` bigint(20) unsigned NOT NULL,
  `distance_km` int(10) unsigned DEFAULT NULL,
  `price_standard` decimal(10,2) NOT NULL,
  `price_vip` decimal(10,2) NOT NULL,
  `price_luxury` decimal(10,2) DEFAULT NULL,
  `estimated_duration_minutes` int(10) unsigned DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_route` (`company_id`,`origin_city_id`,`dest_city_id`),
  KEY `idx_routes_company` (`company_id`),
  KEY `idx_routes_cities` (`origin_city_id`,`dest_city_id`),
  KEY `dest_city_id` (`dest_city_id`),
  CONSTRAINT `routes_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE CASCADE,
  CONSTRAINT `routes_ibfk_2` FOREIGN KEY (`origin_city_id`) REFERENCES `cities` (`id`),
  CONSTRAINT `routes_ibfk_3` FOREIGN KEY (`dest_city_id`) REFERENCES `cities` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=55 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `routes`
--

LOCK TABLES `routes` WRITE;
/*!40000 ALTER TABLE `routes` DISABLE KEYS */;
INSERT INTO `routes` VALUES (1,1,3,2,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(2,1,2,3,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(3,1,3,1,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(4,1,1,3,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(5,2,2,1,240,4000.00,6000.00,NULL,240,1,'2026-05-25 11:35:16'),(6,2,1,2,240,4000.00,6000.00,NULL,240,1,'2026-05-25 11:35:16'),(7,2,2,3,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(8,2,3,2,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(9,3,1,2,240,4000.00,6000.00,6500.00,240,1,'2026-05-25 11:35:16'),(10,3,2,1,240,4000.00,6000.00,6500.00,240,1,'2026-05-25 11:35:16'),(11,3,1,3,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(12,3,3,1,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(13,3,2,5,80,2000.00,4000.00,NULL,75,1,'2026-05-25 11:35:16'),(14,3,5,2,80,2000.00,4000.00,NULL,75,1,'2026-05-25 11:35:16'),(15,4,2,3,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(16,4,3,2,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(17,4,2,1,240,4000.00,6000.00,NULL,240,1,'2026-05-25 11:35:16'),(18,4,1,2,240,4000.00,6000.00,NULL,240,1,'2026-05-25 11:35:16'),(19,5,1,2,240,4000.00,6000.00,NULL,240,1,'2026-05-25 11:35:16'),(20,5,2,1,240,4000.00,6000.00,NULL,240,1,'2026-05-25 11:35:16'),(21,5,1,5,340,6500.00,8500.00,NULL,320,1,'2026-05-25 11:35:16'),(22,5,5,1,340,6500.00,8500.00,NULL,320,1,'2026-05-25 11:35:16'),(23,5,1,4,270,6000.00,8000.00,NULL,270,1,'2026-05-25 11:35:16'),(24,5,4,1,270,6000.00,8000.00,NULL,270,1,'2026-05-25 11:35:16'),(25,6,3,2,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(26,6,2,3,360,6500.00,8500.00,NULL,300,1,'2026-05-25 11:35:16'),(27,6,3,1,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(28,6,1,3,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(29,7,3,1,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(30,7,1,3,400,6500.00,8500.00,NULL,360,1,'2026-05-25 11:35:16'),(31,8,4,2,300,6000.00,8000.00,NULL,270,1,'2026-05-25 11:35:16'),(32,8,2,4,300,6000.00,8000.00,NULL,270,1,'2026-05-25 11:35:16'),(33,8,4,1,270,6000.00,8000.00,NULL,255,1,'2026-05-25 11:35:16'),(34,8,1,4,270,6000.00,8000.00,NULL,255,1,'2026-05-25 11:35:16'),(35,9,2,1,240,4000.00,6000.00,6500.00,240,1,'2026-05-25 11:35:16'),(36,9,1,2,240,4000.00,6000.00,6500.00,240,1,'2026-05-25 11:35:16'),(37,9,2,5,80,2000.00,4000.00,NULL,75,1,'2026-05-25 11:35:16'),(38,9,5,2,80,2000.00,4000.00,NULL,75,1,'2026-05-25 11:35:16'),(39,9,2,6,70,2000.00,2600.00,NULL,70,1,'2026-05-25 11:35:16'),(40,9,6,2,70,2000.00,2600.00,NULL,70,1,'2026-05-25 11:35:16'),(41,10,1,2,240,4000.00,6000.00,6500.00,240,1,'2026-05-25 11:35:16'),(42,10,2,1,240,4000.00,6000.00,6500.00,240,1,'2026-05-25 11:35:16'),(43,10,1,7,550,15000.00,20000.00,14000.00,540,1,'2026-05-25 11:35:16'),(44,10,7,1,550,15000.00,20000.00,14000.00,540,1,'2026-05-25 11:35:16'),(45,11,10,2,120,2500.00,3250.00,NULL,120,1,'2026-05-25 11:35:16'),(46,11,2,10,120,2500.00,3250.00,NULL,120,1,'2026-05-25 11:35:16'),(47,11,10,5,60,1500.00,1950.00,NULL,60,1,'2026-05-25 11:35:16'),(48,11,5,10,60,1500.00,1950.00,NULL,60,1,'2026-05-25 11:35:16'),(49,12,4,3,120,2500.00,4500.00,NULL,150,1,'2026-05-25 11:35:16'),(50,12,3,4,120,2500.00,4500.00,NULL,150,1,'2026-05-25 11:35:16'),(51,12,4,1,270,6000.00,8000.00,NULL,255,1,'2026-05-25 11:35:16'),(52,12,1,4,270,6000.00,8000.00,NULL,255,1,'2026-05-25 11:35:16'),(53,3,1,6,310,6500.00,8500.00,NULL,270,1,'2026-05-26 04:09:14'),(54,3,6,1,310,6500.00,8500.00,NULL,270,1,'2026-05-26 04:09:14');
/*!40000 ALTER TABLE `routes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `schedules`
--

DROP TABLE IF EXISTS `schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `schedules` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `route_id` bigint(20) unsigned NOT NULL,
  `bus_id` bigint(20) unsigned NOT NULL,
  `origin_branch_id` bigint(20) unsigned NOT NULL,
  `dest_branch_id` bigint(20) unsigned NOT NULL,
  `travel_date` date NOT NULL,
  `departure_time` time NOT NULL,
  `estimated_arrival_time` time DEFAULT NULL,
  `shift` enum('morning','afternoon','night') NOT NULL DEFAULT 'morning',
  `status` enum('scheduled','boarding','departed','arrived','cancelled') NOT NULL DEFAULT 'scheduled',
  `available_seats` tinyint(3) unsigned NOT NULL DEFAULT 70,
  `booked_seats` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_schedules_route_date` (`route_id`,`travel_date`),
  KEY `idx_schedules_bus` (`bus_id`),
  KEY `idx_schedules_status` (`status`),
  KEY `origin_branch_id` (`origin_branch_id`),
  KEY `dest_branch_id` (`dest_branch_id`),
  CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`),
  CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`),
  CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`origin_branch_id`) REFERENCES `branches` (`id`),
  CONSTRAINT `schedules_ibfk_4` FOREIGN KEY (`dest_branch_id`) REFERENCES `branches` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `schedules`
--

LOCK TABLES `schedules` WRITE;
/*!40000 ALTER TABLE `schedules` DISABLE KEYS */;
INSERT INTO `schedules` VALUES (1,1,1,1,4,'2026-05-25','06:00:00','11:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(2,1,2,1,5,'2026-05-25','07:30:00','12:30:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(3,1,1,1,4,'2026-05-26','06:00:00','11:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(4,1,2,1,5,'2026-05-26','07:30:00','12:30:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(5,1,1,2,4,'2026-05-27','06:00:00','11:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(6,3,1,1,6,'2026-05-25','05:00:00','11:00:00','morning','scheduled',68,2,'2026-05-25 11:35:16','2026-05-25 12:25:26'),(7,3,2,3,7,'2026-05-25','14:00:00','20:00:00','afternoon','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(8,3,1,1,6,'2026-05-26','05:00:00','11:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(9,5,4,8,10,'2026-05-25','06:00:00','10:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(10,5,5,8,11,'2026-05-25','13:00:00','17:00:00','afternoon','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(11,5,4,8,10,'2026-05-26','06:00:00','10:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(12,5,5,9,10,'2026-05-26','20:00:00','00:00:00','night','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(13,9,6,13,15,'2026-05-25','07:00:00','11:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(14,9,7,14,15,'2026-05-25','09:00:00','13:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(15,9,8,13,16,'2026-05-26','07:00:00','11:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(16,19,11,23,25,'2026-05-25','06:30:00','10:30:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(17,19,12,24,25,'2026-05-25','14:00:00','18:00:00','afternoon','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(18,19,11,23,25,'2026-05-26','06:30:00','10:30:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(19,35,18,36,38,'2026-05-25','07:00:00','11:00:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(20,35,19,37,38,'2026-05-25','13:00:00','17:00:00','afternoon','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(21,35,20,36,38,'2026-05-25','20:00:00','00:00:00','night','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(22,35,18,36,38,'2026-05-26','07:00:00','11:00:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(23,41,21,41,42,'2026-05-25','08:00:00','12:00:00','morning','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(24,41,22,41,42,'2026-05-25','14:00:00','18:00:00','afternoon','scheduled',70,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(25,37,18,36,39,'2026-05-25','07:30:00','09:00:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(26,37,19,37,39,'2026-05-25','11:00:00','12:30:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(27,37,18,36,39,'2026-05-26','07:30:00','09:00:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(28,49,24,47,48,'2026-05-25','06:00:00','08:30:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(29,49,25,47,48,'2026-05-25','12:00:00','14:30:00','afternoon','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(30,49,24,47,48,'2026-05-26','06:00:00','08:30:00','morning','scheduled',30,0,'2026-05-25 11:35:16','2026-05-25 11:35:16'),(31,3,1,1,6,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(32,3,1,1,6,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(33,12,6,17,13,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(34,12,6,17,13,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(35,27,13,28,30,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(36,27,13,28,30,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(37,29,15,31,32,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(38,29,15,31,32,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:52:13','2026-05-26 03:52:13'),(39,3,1,1,6,'2026-05-27','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(40,3,1,1,6,'2026-05-27','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(41,12,6,17,13,'2026-05-27','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(42,12,6,17,13,'2026-05-27','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(43,27,13,28,30,'2026-05-27','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(44,27,13,28,30,'2026-05-27','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(45,29,15,31,32,'2026-05-27','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(46,29,15,31,32,'2026-05-27','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 03:56:14','2026-05-26 03:56:14'),(47,53,6,13,50,'2026-05-26','06:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(48,53,6,13,50,'2026-05-26','08:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(49,53,6,13,50,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(50,53,6,13,50,'2026-05-26','12:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(51,53,6,13,50,'2026-05-26','14:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(52,53,6,13,50,'2026-05-26','16:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(53,53,6,13,50,'2026-05-26','18:00:00',NULL,'night','scheduled',70,0,'2026-05-26 04:17:59','2026-05-26 04:17:59'),(54,21,11,23,26,'2026-05-26','06:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(55,21,11,23,26,'2026-05-26','08:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(56,21,11,23,26,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(57,21,11,23,26,'2026-05-26','12:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(58,21,11,23,26,'2026-05-26','14:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(59,21,11,23,26,'2026-05-26','16:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(60,21,11,23,26,'2026-05-26','18:00:00',NULL,'night','scheduled',70,0,'2026-05-26 05:04:25','2026-05-26 05:04:25'),(61,4,1,6,2,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(62,4,1,6,2,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(63,11,6,13,17,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(64,11,6,13,17,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(65,28,13,30,28,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(66,28,13,30,28,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(67,30,15,32,31,'2026-05-26','10:00:00',NULL,'morning','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24'),(68,30,15,32,31,'2026-05-26','20:00:00',NULL,'night','scheduled',70,0,'2026-05-26 06:22:24','2026-05-26 06:22:24');
/*!40000 ALTER TABLE `schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seats`
--

DROP TABLE IF EXISTS `seats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seats` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `bus_id` bigint(20) unsigned NOT NULL,
  `seat_number` varchar(10) NOT NULL,
  `row_number` tinyint(3) unsigned NOT NULL,
  `seat_position` enum('window_left','middle','window_right','aisle_left','aisle_right') DEFAULT 'window_left',
  `seat_type` enum('standard','vip','driver') NOT NULL DEFAULT 'standard',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bus_seat` (`bus_id`,`seat_number`),
  KEY `idx_seats_bus` (`bus_id`),
  CONSTRAINT `seats_ibfk_1` FOREIGN KEY (`bus_id`) REFERENCES `buses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seats`
--

LOCK TABLES `seats` WRITE;
/*!40000 ALTER TABLE `seats` DISABLE KEYS */;
INSERT INTO `seats` VALUES (1,1,'1A',1,'window_left','vip'),(2,1,'1B',1,'aisle_left','standard'),(3,1,'1C',1,'aisle_right','standard'),(4,1,'1D',1,'window_right','vip'),(5,1,'2A',2,'window_left','vip'),(6,1,'2B',2,'aisle_left','standard'),(7,1,'2C',2,'aisle_right','standard'),(8,1,'2D',2,'window_right','vip'),(9,1,'3A',3,'window_left','vip'),(10,1,'3B',3,'aisle_left','standard'),(11,1,'3C',3,'aisle_right','standard'),(12,1,'3D',3,'window_right','vip'),(13,1,'4A',4,'window_left','standard'),(14,1,'4B',4,'aisle_left','standard'),(15,1,'4C',4,'aisle_right','standard'),(16,1,'4D',4,'window_right','standard'),(17,1,'5A',5,'window_left','standard'),(18,1,'5B',5,'aisle_left','standard'),(19,1,'5C',5,'aisle_right','standard'),(20,1,'5D',5,'window_right','standard'),(21,1,'6A',6,'window_left','standard'),(22,1,'6B',6,'aisle_left','standard'),(23,1,'6C',6,'aisle_right','standard'),(24,1,'6D',6,'window_right','standard'),(25,1,'7A',7,'window_left','standard'),(26,1,'7B',7,'aisle_left','standard'),(27,1,'7C',7,'aisle_right','standard'),(28,1,'7D',7,'window_right','standard'),(29,1,'8A',8,'window_left','standard'),(30,1,'8B',8,'aisle_left','standard'),(31,1,'8C',8,'aisle_right','standard'),(32,1,'8D',8,'window_right','standard'),(33,1,'9A',9,'window_left','standard'),(34,1,'9B',9,'aisle_left','standard'),(35,1,'9C',9,'aisle_right','standard'),(36,1,'9D',9,'window_right','standard'),(37,1,'10A',10,'window_left','standard'),(38,1,'10B',10,'aisle_left','standard'),(39,1,'10C',10,'aisle_right','standard'),(40,1,'10D',10,'window_right','standard'),(41,1,'11A',11,'window_left','standard'),(42,1,'11B',11,'aisle_left','standard'),(43,1,'11C',11,'aisle_right','standard'),(44,1,'11D',11,'window_right','standard'),(45,1,'12A',12,'window_left','standard'),(46,1,'12B',12,'aisle_left','standard'),(47,1,'12C',12,'aisle_right','standard'),(48,1,'12D',12,'window_right','standard'),(49,1,'13A',13,'window_left','standard'),(50,1,'13B',13,'aisle_left','standard'),(51,1,'13C',13,'aisle_right','standard'),(52,1,'13D',13,'window_right','standard'),(53,1,'14A',14,'window_left','standard'),(54,1,'14B',14,'aisle_left','standard'),(55,1,'14C',14,'aisle_right','standard'),(56,1,'14D',14,'window_right','standard'),(57,1,'15A',15,'window_left','standard'),(58,1,'15B',15,'aisle_left','standard'),(59,1,'15C',15,'aisle_right','standard'),(60,1,'15D',15,'window_right','standard'),(61,1,'16A',16,'window_left','standard'),(62,1,'16B',16,'aisle_left','standard'),(63,1,'16C',16,'aisle_right','standard'),(64,1,'16D',16,'window_right','standard'),(65,1,'17A',17,'window_left','standard'),(66,1,'17B',17,'aisle_left','standard'),(67,1,'17C',17,'aisle_right','standard'),(68,1,'17D',17,'window_right','standard'),(69,1,'18A',18,'window_left','standard'),(70,1,'18B',18,'aisle_left','standard');
/*!40000 ALTER TABLE `seats` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tickets` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `ticket_code` varchar(30) NOT NULL,
  `booking_id` bigint(20) unsigned NOT NULL,
  `booking_seat_id` bigint(20) unsigned NOT NULL,
  `qr_payload` text NOT NULL,
  `status` enum('valid','used','expired','cancelled') NOT NULL DEFAULT 'valid',
  `used_at` timestamp NULL DEFAULT NULL,
  `validated_by` bigint(20) unsigned DEFAULT NULL,
  `issued_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `ticket_code` (`ticket_code`),
  KEY `idx_tickets_code` (`ticket_code`),
  KEY `idx_tickets_booking` (`booking_id`),
  KEY `idx_tickets_status` (`status`),
  KEY `validated_by` (`validated_by`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`validated_by`) REFERENCES `admins` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(180) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `language` enum('en','fr') NOT NULL DEFAULT 'fr',
  `fcm_token` varchar(500) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_phone` (`phone`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Mbo Peter ','mbopeter67@gmail.com','673846800','$2y$12$RRYv9M/.59TxMqY3w1aoG./ZeoQ/qonJgauMrygSpdPTylEb5qElu',NULL,'en',NULL,0,1,'2026-05-25 11:50:43','2026-05-25 11:50:43',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary table structure for view `v_active_schedules`
--

DROP TABLE IF EXISTS `v_active_schedules`;
/*!50001 DROP VIEW IF EXISTS `v_active_schedules`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `v_active_schedules` AS SELECT
 1 AS `id`,
  1 AS `travel_date`,
  1 AS `departure_time`,
  1 AS `shift`,
  1 AS `status`,
  1 AS `available_seats`,
  1 AS `booked_seats`,
  1 AS `price_standard`,
  1 AS `price_vip`,
  1 AS `price_luxury`,
  1 AS `distance_km`,
  1 AS `estimated_duration_minutes`,
  1 AS `company_id`,
  1 AS `company_name`,
  1 AS `logo_url`,
  1 AS `rating`,
  1 AS `origin_city`,
  1 AS `dest_city`,
  1 AS `origin_branch`,
  1 AS `dest_branch`,
  1 AS `plate_number`,
  1 AS `bus_signature`,
  1 AS `bus_type`,
  1 AS `total_seats`,
  1 AS `is_faulty` */;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `v_active_schedules`
--

/*!50001 DROP VIEW IF EXISTS `v_active_schedules`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_active_schedules` AS select `s`.`id` AS `id`,`s`.`travel_date` AS `travel_date`,`s`.`departure_time` AS `departure_time`,`s`.`shift` AS `shift`,`s`.`status` AS `status`,`s`.`available_seats` AS `available_seats`,`s`.`booked_seats` AS `booked_seats`,`r`.`price_standard` AS `price_standard`,`r`.`price_vip` AS `price_vip`,`r`.`price_luxury` AS `price_luxury`,`r`.`distance_km` AS `distance_km`,`r`.`estimated_duration_minutes` AS `estimated_duration_minutes`,`c`.`id` AS `company_id`,`c`.`name` AS `company_name`,`c`.`logo_url` AS `logo_url`,`c`.`rating` AS `rating`,`oc`.`name` AS `origin_city`,`dc`.`name` AS `dest_city`,`ob`.`name` AS `origin_branch`,`db`.`name` AS `dest_branch`,`b`.`plate_number` AS `plate_number`,`b`.`bus_signature` AS `bus_signature`,`b`.`bus_type` AS `bus_type`,`b`.`total_seats` AS `total_seats`,`b`.`is_faulty` AS `is_faulty` from (((((((`schedules` `s` join `routes` `r` on(`s`.`route_id` = `r`.`id`)) join `companies` `c` on(`r`.`company_id` = `c`.`id`)) join `cities` `oc` on(`r`.`origin_city_id` = `oc`.`id`)) join `cities` `dc` on(`r`.`dest_city_id` = `dc`.`id`)) join `branches` `ob` on(`s`.`origin_branch_id` = `ob`.`id`)) join `branches` `db` on(`s`.`dest_branch_id` = `db`.`id`)) join `buses` `b` on(`s`.`bus_id` = `b`.`id`)) where `s`.`status` not in ('cancelled','arrived','departed') and `c`.`is_active` = 1 and `r`.`is_active` = 1 and `b`.`is_faulty` = 0 */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-26  8:27:44
