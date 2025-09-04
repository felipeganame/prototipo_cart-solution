-- =============================================================================
-- PEDI SOLUTIONS - Complete Database Dump
-- =============================================================================
-- 
-- Creado: 4 de Septiembre, 2025
-- Versión: 1.0 - Producción completa
-- 
-- CARACTERÍSTICAS INCLUIDAS:
-- ✅ Sistema de usuarios con estados separados (account_status, payment_status)
-- ✅ Sistema de tiendas con direcciones normalizadas (street_name, street_number)
-- ✅ Sistema de pagos completo con payment_records
-- ✅ Triggers automáticos para manejo de estados
-- ✅ Datos de ejemplo listos para usar
-- 
-- USUARIOS DE EJEMPLO:
-- 👤 Admin: admin@pedisolution.com (password: admin123)
-- 👤 Demo:  user@pedisolution.com (password: user123)
-- 
-- INSTALACIÓN:
-- mysql -u root -p pedi_solutions < scripts/pedi_solutions_dump.sql
-- 
-- =============================================================================

-- MySQL dump 10.13  Distrib 9.4.0, for macos15.4 (arm64)
--
-- Host: localhost    Database: pedi_solutions
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `icon` varchar(100) DEFAULT NULL,
  `background_image_url` varchar(500) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_per_store` (`store_id`,`name`),
  KEY `idx_categories_store_id` (`store_id`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` decimal(10,2) NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `idx_order_items_order_id` (`order_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `store_id` int NOT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('efectivo','otro') DEFAULT 'efectivo',
  `cash_amount` decimal(10,2) DEFAULT NULL,
  `change_amount` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','confirmed','preparing','ready','delivered','cancelled') DEFAULT 'pending',
  `whatsapp_sent` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_store_id` (`store_id`),
  KEY `idx_orders_created_at` (`created_at`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`store_id`) REFERENCES `stores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_history`
--

DROP TABLE IF EXISTS `payment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `fecha_pago` date NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('manual','automatico') DEFAULT 'manual',
  `periodo_pagado` varchar(20) DEFAULT NULL,
  `estado_anterior` enum('Activo','En deuda','En gracia','Bloqueado Parcial') DEFAULT NULL,
  `estado_nuevo` enum('Activo','En deuda','En gracia','Bloqueado Parcial') DEFAULT NULL,
  `notas` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payment_history_user_id` (`user_id`),
  KEY `idx_payment_history_fecha_pago` (`fecha_pago`),
  CONSTRAINT `payment_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_history`
--

LOCK TABLES `payment_history` WRITE;
/*!40000 ALTER TABLE `payment_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `payment_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment_records`
--

DROP TABLE IF EXISTS `payment_records`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_records` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('admin','credit_card','paypal','bank_transfer') DEFAULT 'admin',
  `payment_details` json DEFAULT NULL,
  `created_by_admin` tinyint(1) DEFAULT '1',
  `admin_id` int DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `admin_id` (`admin_id`),
  CONSTRAINT `payment_records_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payment_records_ibfk_2` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment_records`
--

LOCK TABLES `payment_records` WRITE;
/*!40000 ALTER TABLE `payment_records` DISABLE KEYS */;
INSERT INTO `payment_records` VALUES (1,5,20.00,'2025-09-04','admin',NULL,1,1,'Pago registrado por administrador','2025-09-04 18:26:59'),(2,4,20.00,'2025-09-04','admin',NULL,1,1,'Pago registrado por administrador','2025-09-04 19:06:00');
/*!40000 ALTER TABLE `payment_records` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_products_category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stores`
--

DROP TABLE IF EXISTS `stores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `address` text,
  `phone` varchar(20) DEFAULT NULL,
  `whatsapp_number` varchar(20) DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `qr_code` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `country` varchar(100) DEFAULT NULL,
  `state_province` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `postal_code` varchar(20) DEFAULT NULL,
  `street_name` varchar(200) DEFAULT NULL,
  `street_number` varchar(50) DEFAULT NULL,
  `street_address` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `qr_code` (`qr_code`),
  KEY `idx_stores_user_id` (`user_id`),
  KEY `idx_stores_qr_code` (`qr_code`),
  KEY `idx_stores_country` (`country`),
  KEY `idx_stores_state_province` (`state_province`),
  KEY `idx_stores_city` (`city`),
  KEY `idx_stores_postal_code` (`postal_code`),
  CONSTRAINT `stores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stores`
--

LOCK TABLES `stores` WRITE;
/*!40000 ALTER TABLE `stores` DISABLE KEYS */;
INSERT INTO `stores` VALUES (1,3,'Qwertyuiop',NULL,NULL,NULL,'+57 123 456 7878',NULL,1,'store_3_1756853752841','2025-09-02 22:55:52','2025-09-02 22:55:52',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,4,'Qwertyuiop',NULL,NULL,NULL,'+57 123 456 7899',NULL,1,'store_4_1756854127920','2025-09-02 23:02:07','2025-09-02 23:02:07',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,5,'el bar de pedro',NULL,NULL,NULL,'+54 93513363008',NULL,1,'store_5_1756938271262','2025-09-03 22:24:31','2025-09-03 22:24:31',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,2,'La tienda de Mario',NULL,NULL,NULL,'+54 93513363008',NULL,1,'store_2_1757012372086','2025-09-04 18:59:32','2025-09-04 18:59:32','Argentina','Cordoba','Cordoba','5021','Av. ejercito argentino','9520',NULL);
/*!40000 ALTER TABLE `stores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_notifications`
--

DROP TABLE IF EXISTS `subscription_notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `tipo_notificacion` enum('preventivo','vencimiento','gracia','suspension') NOT NULL,
  `fecha_notificacion` date NOT NULL,
  `dias_restantes` int DEFAULT NULL,
  `mensaje` text,
  `enviada` tinyint(1) DEFAULT '0',
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subscription_notifications_user_id` (`user_id`),
  KEY `idx_subscription_notifications_fecha_notificacion` (`fecha_notificacion`),
  CONSTRAINT `subscription_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_notifications`
--

LOCK TABLES `subscription_notifications` WRITE;
/*!40000 ALTER TABLE `subscription_notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription_notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_plans`
--

DROP TABLE IF EXISTS `user_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `max_stores` int NOT NULL,
  `max_products_per_store` int NOT NULL,
  `max_categories_per_store` int NOT NULL,
  `features` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_plans`
--

LOCK TABLES `user_plans` WRITE;
/*!40000 ALTER TABLE `user_plans` DISABLE KEYS */;
INSERT INTO `user_plans` VALUES (1,'Básico',9.99,1,50,10,'{\"analytics\": false, \"custom_branding\": false, \"priority_support\": false}','2025-09-02 22:47:36','2025-09-02 22:47:36'),(2,'Profesional',19.99,3,200,25,'{\"analytics\": true, \"custom_branding\": false, \"priority_support\": false}','2025-09-02 22:47:36','2025-09-02 22:47:36'),(3,'Premium',39.99,999,999,999,'{\"analytics\": true, \"custom_branding\": true, \"priority_support\": true}','2025-09-02 22:47:36','2025-09-02 22:47:36');
/*!40000 ALTER TABLE `user_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `plan_id` int DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `country_code` varchar(10) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `account_status` enum('activo','inactivo') DEFAULT 'activo',
  `subscription_start` date DEFAULT NULL,
  `subscription_end` date DEFAULT NULL,
  `fecha_inicio_suscripcion` date DEFAULT NULL,
  `dia_vencimiento` int DEFAULT NULL,
  `ultimo_pago` date DEFAULT NULL,
  `estado_suscripcion` enum('Activo','En deuda','En gracia','Bloqueado Parcial') DEFAULT 'Activo',
  `fecha_proximo_vencimiento` date DEFAULT NULL,
  `dias_gracia_restantes` int DEFAULT '0',
  `last_payment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `monthly_payment` decimal(10,2) DEFAULT '20.00',
  `max_stores` int DEFAULT '1',
  `next_payment_due` date DEFAULT NULL,
  `days_overdue` int DEFAULT '0',
  `payment_status` enum('al_dia','en_deuda') DEFAULT 'en_deuda',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `plan_id` (`plan_id`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_estado_suscripcion` (`estado_suscripcion`),
  KEY `idx_users_fecha_proximo_vencimiento` (`fecha_proximo_vencimiento`),
  KEY `idx_users_account_status` (`account_status`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `user_plans` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin@pedisolution.com','$2b$10$tRwasfCGHvMCrqGxfmT/0eiCSyWI4uXwr292QzdnZZrX5RF9FrMOu','admin',3,'Pedi Solutions','Admin','User',NULL,NULL,1,'activo','2025-09-02','2026-09-02',NULL,NULL,NULL,'Activo',NULL,0,NULL,'2025-09-02 22:47:36','2025-09-04 18:06:31',20.00,1,NULL,0,'al_dia'),(2,'user@pedisolution.com','$2b$10$Ya/gFXLvnE9qAAxpddaio.3OXBdFOU2syENYdkrYDi2UMS3Ca.ISm','user',2,'Mi Licorería','Usuario','Demo',NULL,NULL,1,'activo','2025-09-02','2025-10-02',NULL,NULL,NULL,'Activo',NULL,0,NULL,'2025-09-02 22:47:36','2025-09-04 18:11:37',20.00,1,'2025-10-03',0,'al_dia'),(3,'qwertyuio@gmail.com','$2b$10$yDycB4hg4VTOEFiNE0U6POieVNfaeNIZjojUCuU0AqMu/zWIRSMVC','user',1,'Qwertyuiop','Qwertyuiop','','+57 123 456 7878','+54',1,'activo','2025-09-02','2025-10-02',NULL,NULL,NULL,'Activo',NULL,0,NULL,'2025-09-02 22:55:52','2025-09-04 18:13:06',20.00,1,'2025-10-03',0,'al_dia'),(4,'juan@gmail.com','$2b$10$owWDJ50JYPNRHLhslURErOfOc2mH.OE2U9IZA1G4jxU343U7hCKN6','user',1,'Qwertyuiop','juan','','+57 123 456 7899','+54',1,'activo','2025-09-02','2025-10-02',NULL,NULL,NULL,'Activo',NULL,0,'2025-09-04','2025-09-02 23:02:07','2025-09-04 19:06:00',20.00,2,'2025-10-04',0,'al_dia'),(5,'pedrito@gmail.com','$2b$10$1kMfeWOjY9oqmQ3zLuNgWe5Od7vLpxz3rbt3XtKSgsgxhhJ30OR2W','user',1,'el bar de pedro','pedro martinez','','+54 93513363008','+54',1,'activo','2025-09-03','2025-10-03',NULL,NULL,NULL,'Activo',NULL,0,'2025-09-04','2025-09-03 22:24:31','2025-09-04 19:05:04',20.00,2,'2025-10-04',0,'al_dia');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_payment_and_account_status` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
    -- Solo ejecutar la lógica automática si se está actualizando next_payment_due
    -- o si es una actualización del sistema (no manual del admin)
    IF NEW.next_payment_due != OLD.next_payment_due OR NEW.last_payment_date != OLD.last_payment_date THEN
        -- Calcular días de retraso basado en next_payment_due
        IF NEW.next_payment_due IS NOT NULL AND NEW.next_payment_due < CURDATE() THEN
            SET NEW.days_overdue = DATEDIFF(CURDATE(), NEW.next_payment_due);
            
            -- Si tiene más de 7 días de retraso, desactivar cuenta automáticamente
            IF NEW.days_overdue > 7 THEN
                SET NEW.account_status = 'inactivo';
                SET NEW.payment_status = 'en_deuda';
            ELSEIF NEW.days_overdue > 0 THEN
                -- Entre 1-7 días: mantener cuenta activa pero marcar en deuda
                -- Solo cambiar si no está siendo actualizado manualmente
                IF NEW.account_status = OLD.account_status THEN
                    SET NEW.payment_status = 'en_deuda';
                END IF;
            END IF;
        ELSE
            -- Pagos al día
            SET NEW.days_overdue = 0;
            -- Solo actualizar payment_status si no se está cambiando manualmente
            IF NEW.payment_status = OLD.payment_status THEN
                SET NEW.payment_status = 'al_dia';
            END IF;
        END IF;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-04 16:15:48
