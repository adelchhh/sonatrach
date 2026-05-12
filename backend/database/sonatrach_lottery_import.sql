-- phpMyAdmin SQL Dump - friend's latest DB state
-- Reset everything first
DROP DATABASE IF EXISTS sonatrach_lottery;
CREATE DATABASE sonatrach_lottery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sonatrach_lottery;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- activities
CREATE TABLE `activities` (
  `id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` enum('SPORT','FAMILY','STAY','NATURE','SPIRITUAL','TRAVEL','LEISURE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'LEISURE',
  `minimum_seniority` int NOT NULL DEFAULT '1',
  `draw_enabled` tinyint(1) NOT NULL DEFAULT '1',
  `demand_level` enum('HIGH','MEDIUM','LOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MEDIUM',
  `status` enum('DRAFT','PUBLISHED','ARCHIVED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `deleted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activities` (`id`, `title`, `description`, `image_url`, `category`, `minimum_seniority`, `draw_enabled`, `demand_level`, `status`, `deleted_at`, `created_at`, `updated_at`) VALUES
(2, 'Cross', 'Un grand rendez-vous sportif et convivial.', '/storage/activities/Dol62Ezr3HrLFG3M5sxirTcBN1j1Wbd89ookhFu7.jpg', 'SPORT', 1, 0, 'HIGH', 'PUBLISHED', NULL, '2026-04-19 18:14:28', '2026-05-02 20:31:38'),
(3, 'Colonie de vacances', 'Une aventure inoubliable pour les enfants.', '/storage/activities/DCB98nGSLpEeujvY8YZabsStfv9QsLGW9z2bTHT8.jpg', 'FAMILY', 1, 1, 'HIGH', 'PUBLISHED', NULL, '2026-04-19 18:14:28', '2026-05-02 19:20:18'),
(4, 'Bangalo', 'Une escapade detente en bungalow.', '/storage/activities/60U4eeJ1KRZQHvq3XIGMsgtBmsK39zYRncxj5eR7.jpg', 'STAY', 1, 1, 'MEDIUM', 'DRAFT', NULL, '2026-04-19 18:14:28', '2026-05-02 19:28:43'),
(5, 'Camp de toile', 'Un sejour nature authentique.', NULL, 'NATURE', 1, 1, 'MEDIUM', 'PUBLISHED', NULL, '2026-04-19 18:14:28', '2026-04-19 18:14:28'),
(6, 'Cure thermale', 'Une parenthese bien-etre.', '/storage/activities/oLxSwGvtWrBpfa7xV2xosozL3pkpik0qgFRqHUfv.jpg', 'LEISURE', 1, 1, 'MEDIUM', 'CANCELLED', NULL, '2026-04-19 18:14:28', '2026-05-02 20:31:56'),
(7, 'Omra', 'Un voyage spirituel profond.', '/storage/activities/oKg3AWe9rO32Yy69DEim8eUrX5d3X97GlNqR0kUr.jpg', 'SPIRITUAL', 1, 1, 'HIGH', 'ARCHIVED', NULL, '2026-04-19 18:14:28', '2026-05-02 20:43:54'),
(8, 'Voyages organises', 'Des voyages riches en decouvertes.', '/storage/activities/oOyh3uchZwkwccLuQwU6zVH8GC4rAL3joGIZfAE2.jpg', 'TRAVEL', 1, 1, 'MEDIUM', 'PUBLISHED', NULL, '2026-04-19 18:14:28', '2026-05-02 19:26:45'),
(9, 'Sortie aeree', 'Une journee d evasion en plein air.', NULL, 'NATURE', 1, 1, 'MEDIUM', 'ARCHIVED', NULL, '2026-04-19 18:14:28', '2026-04-19 18:16:46'),
(10, 'activity test', 'test test', '/storage/activities/8yUvP7c64sy6Ym0j6qF7Ec5nMWlx6IEJw9VjWBmC.jpg', 'FAMILY', 1, 1, 'MEDIUM', 'DRAFT', NULL, '2026-05-09 00:02:26', '2026-05-09 00:02:26');

-- activity_sessions
CREATE TABLE `activity_sessions` (
  `id` int NOT NULL,
  `activity_id` int NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `registration_deadline` date NOT NULL,
  `draw_date` date DEFAULT NULL,
  `draw_location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmation_delay_hours` int NOT NULL DEFAULT '48',
  `document_upload_deadline` date DEFAULT NULL,
  `transport_included` tinyint(1) NOT NULL DEFAULT '0',
  `telefax_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `substitutes_count` int NOT NULL DEFAULT '2',
  `status` enum('DRAFT','OPEN','CLOSED','DRAW_DONE','FINISHED','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `activity_sessions` (`id`, `activity_id`, `start_date`, `end_date`, `registration_deadline`, `draw_date`, `draw_location`, `confirmation_delay_hours`, `document_upload_deadline`, `transport_included`, `telefax_url`, `substitutes_count`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, '2026-07-02', '2026-08-02', '2026-06-02', NULL, NULL, 48, '2026-06-06', 1, NULL, 2, 'DRAFT', '2026-05-02 19:00:48', '2026-05-02 19:00:48'),
(2, 2, '2026-06-09', '2026-06-19', '2026-05-30', NULL, NULL, 48, '2026-06-03', 1, NULL, 2, 'DRAFT', '2026-05-04 15:42:14', '2026-05-04 15:42:14');

-- announcements (friend's table)
CREATE TABLE `announcements` (
  `id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `publish_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `announcements` (`id`, `created_by`, `title`, `content`, `document_name`, `document_path`, `status`, `publish_date`, `created_at`, `updated_at`) VALUES
(1, NULL, 'test annoncement', 'test test test', NULL, NULL, 'PUBLISHED', '2026-04-30', '2026-04-30 15:38:19', '2026-04-30 17:43:25');

-- audit_logs
CREATE TABLE `audit_logs` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `target_table` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `target_id` int DEFAULT NULL,
  `target_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action_date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `target_table`, `target_id`, `target_name`, `details`, `ip_address`, `action_date`) VALUES
(1, 4, 'TEST', 'user_roles', 1, 'Test User', '{"role": "FUNCTIONAL_ADMIN"}', '127.0.0.1', '2026-04-26 16:08:33'),
(2, 4, 'Assigned Role', 'user_roles', 20, 'Ilissa Boubekri', '{"role": "FUNCTIONAL_ADMIN"}', '127.0.0.1', '2026-04-26 15:09:36'),
(3, 4, 'Removed Role', 'user_roles', 20, 'Ilissa Boubekri', '{"role": "FUNCTIONAL_ADMIN"}', '127.0.0.1', '2026-04-26 15:10:35'),
(4, 4, 'Assigned Role', 'user_roles', 22, 'Abdel Khalil', '{"role": "SYSTEM_ADMIN"}', '127.0.0.1', '2026-04-26 16:42:29'),
(5, 4, 'Assigned Role', 'user_roles', 23, 'Imene Hebbadj', '{"role": "COMMUNICATOR"}', '127.0.0.1', '2026-04-26 16:43:13'),
(6, 4, 'Removed Role', 'user_roles', 22, 'Abdel Khalil', '{"role": "SYSTEM_ADMIN"}', '127.0.0.1', '2026-04-26 16:43:21'),
(7, 4, 'ANNOUNCEMENT_PUBLISHED', 'official_notes', 1, 'test', NULL, '127.0.0.1', '2026-05-04 15:44:02');

-- Laravel cache
CREATE TABLE `cache` (`key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL, `expiration` bigint NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `cache_locks` (`key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `expiration` bigint NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- certificates
CREATE TABLE `certificates` (
  `id` int NOT NULL,
  `participation_id` int NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `generated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- documents
CREATE TABLE `documents` (
  `document_id` int NOT NULL,
  `registration_id` int NOT NULL,
  `required_document_id` int DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uploaded_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('UPLOADED','VALIDATED','REJECTED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UPLOADED',
  `validation_comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validated_by` int DEFAULT NULL,
  `validated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- draws
CREATE TABLE `draws` (
  `draw_id` int NOT NULL,
  `session_id` int NOT NULL,
  `admin_id` int NOT NULL,
  `draw_date` datetime NOT NULL,
  `draw_location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` enum('BY_SITE','GLOBAL') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GLOBAL',
  `executed` tinyint(1) NOT NULL DEFAULT '0',
  `executed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `draw_results` (
  `id` int NOT NULL,
  `draw_id` int NOT NULL,
  `registration_id` int NOT NULL,
  `session_site_id` int DEFAULT NULL,
  `result_rank` int DEFAULT NULL,
  `is_selected` tinyint(1) NOT NULL DEFAULT '0',
  `is_substitute` tinyint(1) NOT NULL DEFAULT '0',
  `substitute_rank` int DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Laravel jobs
CREATE TABLE `failed_jobs` (`id` bigint UNSIGNED NOT NULL, `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `connection` text COLLATE utf8mb4_unicode_ci NOT NULL, `queue` text COLLATE utf8mb4_unicode_ci NOT NULL, `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL, `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL, `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `jobs` (`id` bigint UNSIGNED NOT NULL, `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL, `attempts` smallint UNSIGNED NOT NULL, `reserved_at` int UNSIGNED DEFAULT NULL, `available_at` int UNSIGNED NOT NULL, `created_at` int UNSIGNED NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `job_batches` (`id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `total_jobs` int NOT NULL, `pending_jobs` int NOT NULL, `failed_jobs` int NOT NULL, `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL, `options` mediumtext COLLATE utf8mb4_unicode_ci, `cancelled_at` int DEFAULT NULL, `created_at` int NOT NULL, `finished_at` int DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ideas (friend's structure)
CREATE TABLE `ideas` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('PENDING','REVIEWED','ARCHIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `moderator_response` text COLLATE utf8mb4_unicode_ci,
  `moderated_by` int DEFAULT NULL,
  `submitted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `moderated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- migrations
CREATE TABLE `migrations` (`id` int UNSIGNED NOT NULL, `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `batch` int NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1, '0001_01_01_000000_create_users_table', 1), (2, '0001_01_01_000001_create_cache_table', 1), (3, '0001_01_01_000002_create_jobs_table', 1), (4, '2026_04_26_191507_create_announcements_table', 1), (5, '2026_04_27_122800_create_surveys_table', 2);

-- notifications (friend's simpler structure)
CREATE TABLE `notifications` (
  `id` int NOT NULL,
  `user_id` int DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('GENERAL','SURVEY','ANNOUNCEMENT','DOCUMENT','DRAW','CONFIRMATION') COLLATE utf8mb4_unicode_ci DEFAULT 'GENERAL',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notifications` (`id`, `user_id`, `created_by`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, NULL, NULL, 'test alert', 'testyy testyyyy', 'GENERAL', 0, '2026-04-30 17:24:32'),
(2, NULL, NULL, 'New Announcement', 'test annoncement', 'ANNOUNCEMENT', 0, '2026-04-30 17:43:25');

-- official_notes (my version - kept for compat)
CREATE TABLE `official_notes` (
  `note_id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('OFFICIAL','GENERAL','REMINDER','EVENT','HEALTH','SOCIAL','SURVEY') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GENERAL',
  `audience` enum('ALL','EMPLOYEES','FUNCTIONAL_ADMIN','COMMUNICATOR','SYSTEM_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ALL',
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DRAFT',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `official_notes` (`note_id`, `user_id`, `title`, `content`, `type`, `audience`, `attachment_url`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
(1, 4, 'test', 'testt', 'EVENT', 'EMPLOYEES', NULL, 'PUBLISHED', '2026-05-04 15:44:02', '2026-05-04 15:44:01', '2026-05-04 15:44:02');

-- participations
CREATE TABLE `participations` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `session_site_id` int NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `rating` tinyint DEFAULT NULL,
  `date_p` date DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (`email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `created_at` timestamp NULL DEFAULT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- registrations
CREATE TABLE `registrations` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `session_id` int NOT NULL,
  `registered_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('PENDING','VALIDATED','REJECTED','SELECTED','WAITING_LIST','CONFIRMED','WITHDRAWN','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `is_eligible` tinyint(1) NOT NULL DEFAULT '1',
  `rejection_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confirmed_at` datetime DEFAULT NULL,
  `withdrawn_at` datetime DEFAULT NULL,
  `withdrawal_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reference_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registrations` (`id`, `user_id`, `session_id`, `registered_at`, `status`, `is_eligible`, `rejection_reason`, `confirmed_at`, `withdrawn_at`, `withdrawal_reason`, `reference_number`, `deleted_at`) VALUES
(1, 4, 2, '2026-05-04 15:42:44', 'PENDING', 1, NULL, NULL, NULL, NULL, 'REG-69F8BE741C708', NULL);

CREATE TABLE `registration_status_history` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `old_status` enum('PENDING','VALIDATED','REJECTED','SELECTED','WAITING_LIST','CONFIRMED','WITHDRAWN','CANCELLED') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `new_status` enum('PENDING','VALIDATED','REJECTED','SELECTED','WAITING_LIST','CONFIRMED','WITHDRAWN','CANCELLED') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `registration_status_history` (`id`, `registration_id`, `old_status`, `new_status`, `reason`, `changed_at`) VALUES
(1, 1, NULL, 'PENDING', 'Initial registration', '2026-05-04 15:42:44');

CREATE TABLE `required_documents` (
  `id` int NOT NULL,
  `activity_id` int NOT NULL,
  `document_type` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '1',
  `template_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- roles
CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` enum('EMPLOYEE','FUNCTIONAL_ADMIN','COMMUNICATOR','SYSTEM_ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'EMPLOYEE', 'Employee access'),
(2, 'FUNCTIONAL_ADMIN', 'Manage activities, sessions, registrations, draws, and reports'),
(3, 'COMMUNICATOR', 'Manage announcements, surveys, ideas, and notifications'),
(4, 'SYSTEM_ADMIN', 'Full system and role management');

CREATE TABLE `sessions` (`id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL, `user_id` bigint UNSIGNED DEFAULT NULL, `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL, `user_agent` text COLLATE utf8mb4_unicode_ci, `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL, `last_activity` int NOT NULL) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `session_sites` (
  `id` int NOT NULL,
  `session_id` int NOT NULL,
  `site_id` int NOT NULL,
  `quota` int NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `session_sites` (`id`, `session_id`, `site_id`, `quota`, `created_at`, `updated_at`) VALUES
(1, 2, 1, 50, '2026-05-04 15:42:26', '2026-05-04 15:42:26');

CREATE TABLE `sites` (
  `id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sites` (`id`, `name`, `address`, `created_at`, `updated_at`) VALUES
(1, 'Site A', 'Alger', '2026-04-19 11:27:07', '2026-04-19 11:27:07'),
(2, 'Site B', 'Oran', '2026-04-19 11:27:07', '2026-04-19 11:27:07'),
(3, 'Site C', 'Constantine', '2026-04-19 11:27:07', '2026-04-19 11:27:07'),
(4, 'test', 'test', '2026-05-08 23:57:19', '2026-05-08 23:57:19');

CREATE TABLE `site_choices` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `session_site_id` int NOT NULL,
  `choice_order` tinyint NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `substitute_replacements` (
  `id` int NOT NULL,
  `abandoned_result_id` int NOT NULL,
  `substitute_result_id` int NOT NULL,
  `abandon_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `replaced_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- surveys (friend's version)
CREATE TABLE `surveys` (
  `id` int NOT NULL,
  `created_by` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('TEXT','CHOICE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXT',
  `required` tinyint(1) DEFAULT '0',
  `status` enum('DRAFT','PUBLISHED','ARCHIVED') COLLATE utf8mb4_unicode_ci DEFAULT 'DRAFT',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `surveys` (`id`, `created_by`, `title`, `question`, `type`, `required`, `status`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(1, NULL, 'test', 'tst', 'TEXT', 0, 'PUBLISHED', '2026-05-01', '2027-02-09', '2026-05-01 20:54:14', '2026-05-01 20:54:14'),
(2, NULL, 'test type 2', 'choose option', 'CHOICE', 0, 'PUBLISHED', '2026-05-01', '2027-02-02', '2026-05-01 20:54:49', '2026-05-01 20:54:49'),
(3, NULL, 'testtt', 'huj', 'TEXT', 0, 'PUBLISHED', '2026-05-01', '4444-08-09', '2026-05-01 20:55:37', '2026-05-01 21:34:51');

CREATE TABLE `survey_options` (
  `id` int NOT NULL,
  `survey_id` int NOT NULL,
  `option_text` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `survey_options` (`id`, `survey_id`, `option_text`, `created_at`) VALUES
(1, 2, 'nana', '2026-05-01 20:54:49'),
(2, 2, 'loulou', '2026-05-01 20:54:49');

CREATE TABLE `survey_responses` (
  `id` int NOT NULL,
  `survey_id` int NOT NULL,
  `user_id` int NOT NULL,
  `answer` text COLLATE utf8mb4_unicode_ci,
  `option_id` int DEFAULT NULL,
  `answered_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `survey_responses` (`id`, `survey_id`, `user_id`, `answer`, `option_id`, `answered_at`) VALUES
(1, 2, 4, NULL, 1, '2026-05-02 18:16:19'),
(2, 3, 4, 'louliu', NULL, '2026-05-02 18:16:25');

-- users
CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `social_security_number` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `hire_date` date DEFAULT NULL,
  `account_created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `name`, `first_name`, `email`, `employee_number`, `social_security_number`, `password`, `address`, `active`, `hire_date`, `account_created_at`, `deleted_at`) VALUES
(4, 'Admin', 'Systeme', 'admin.systeme@sonatrach.dz', '002016', '645765', '$2y$12$lrbCzgYVf9XhHOFAvRawWufAd5ya/AUAbGiWIHG/RFrdAMZRMUd4W', 'Alger, Algerie', 1, NULL, '2026-04-19 12:33:13', NULL),
(5, 'Admin', 'Fonctionnel', 'admin.fonctionnel@sonatrach.dz', '002017', '236384', 'ADMIN002017', 'Alger, Algerie', 1, NULL, '2026-04-19 12:33:13', NULL),
(6, 'Fethallah', 'manel', 'fethallahmanell@gmail.com', '000001', '2791111620938', 'QX9U109018103', 'Rue', 1, NULL, '2026-04-19 12:33:13', NULL),
(7, 'Bougouba', 'Lyna', 'lyna.bougouba.pro@gmail.com', '000002', '2760926459884', 'motdepasse', 'Birkhadem', 1, NULL, '2026-04-19 12:33:13', NULL),
(8, 'Djemai', 'Mohamed abdelhadi', 'djemaiabdallhadi@gmail.com', '000003', '2790237114811', 'jUberCU3OndP', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(9, 'Krim', 'Mouna', 'Krim.mouna08@gmail.com', '000004', '1740144350999', 'bM7dKXPU77lY', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(10, 'Rouchiche', 'Lydia', 'rouchichelydia.sb@gmail.com', '000005', '2770530864723', 'OxGmQvkAYbCP', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(11, 'Douali', 'Anais lina', 'doualilina@gmail.com', '000006', '1901096113461', '524WdidnRLkn', 'Ain aadja', 1, NULL, '2026-04-19 12:33:13', NULL),
(12, 'Bensaidi', 'Khaoula', 'khaoulabnsd01@gmail.com', '000007', '2830220985288', 'EaXVqzf0fgDL', 'Khraicia', 1, NULL, '2026-04-19 12:33:13', NULL),
(13, 'Boumbar', 'Dalel', 'Dalel.boumbar@gmail.com', '000008', '1920387298684', '5x4T80oJxxN9', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(14, 'BENTALEB', 'Lisa', 'lisabentaleb21@gmail.com', '000009', '1700125243811', 'TkVaahszhYiu', 'Bordj El Kiffan', 1, NULL, '2026-04-19 12:33:13', NULL),
(15, 'FOUDI', 'Yasmine', 'yvnmon@gmail.com', '000010', '1791299171697', 'Ztiak7v55DLL', 'Cooperative', 1, NULL, '2026-04-19 12:33:13', NULL),
(16, 'Zemzoum', 'Kahina', 'kahina.zemzoum@gmail.com', '000011', '2861051773982', 'nV6PzalMGLPg', '1er mai', 1, NULL, '2026-04-19 12:33:13', NULL),
(17, 'Hammache', 'Lynda', 'fethallahlynda@yahoo.fr', '000012', '1951175844428', '3lymhY0FciUd', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(18, 'Arab', 'Racha', 'arabracha38@gmail.com', '000013', '2980660414773', 'ZYho69QtegXn', 'Boumerdes', 1, NULL, '2026-04-19 12:33:13', NULL),
(19, 'Hadjali', 'Malak', 'malak.hadjali925@gmail.com', '000014', '1730422074430', 'malak123', 'Mohamadia', 1, NULL, '2026-04-19 12:33:13', NULL),
(20, 'Boubekri', 'Ilissa', 'boubekriilissa@gmail.com', '000015', '1950780159677', 'JbGFGgUJNsn2', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(21, 'Hadjali', 'Abdel malek', 'hadjaliabdou062@gmail.com', '000016', '2700545977369', 'Hhl8H4IAKixm', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(22, 'Khalil', 'Abdel', 'hadjaliabdouu@gmail.com', '000017', '1880135501342', 'hKHAf1f0xMEF', 'Draria', 1, NULL, '2026-04-19 12:33:13', NULL),
(23, 'Hebbadj', 'Imene', 'imenehebbadj4@gmail.com', '000018', '2910289171623', 'rdXwUvGkl72s', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(24, 'Benazouaou', 'Rabah cherif', 'chrifbenazouaou@gmail.com', '000019', '2811216804824', 'vdJczyDbj8LQ', 'birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(25, 'Boudraa', 'Yacine', 'p44257647@gmail.com', '000020', '2880650494239', 'i4IrOVVAsK4T', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(26, 'Zemouri', 'Cerine', 'zemouri.cerine.212131098017@gmail.com', '000021', '1790981204688', '0r59aw3puYRj', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(27, 'Oubaiche', 'Ines malak', 'oubaicheines31@gmail.com', '000022', '1990470630053', 'QVlT41H3QI2b', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(28, 'benadji', 'ismail', 'ismailbenadji78@gmail.com', '000023', '2760426943044', 'UIynQakSMXMZ', 'husin dey', 1, NULL, '2026-04-19 12:33:13', NULL),
(29, 'Kaci', 'Mehdi', 'ff9412177@gmail.com', '000024', '1940194236412', 'pO7WZmRnCf6L', 'Cite 488', 1, NULL, '2026-04-19 12:33:13', NULL),
(30, 'Bouchachia', 'Chaima', 'chaimabouchachia549@gmail.com', '000025', '2881146093018', 'fBpleZe9AYG5', 'Alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(31, 'Allaf', 'Fedoua', 'allaffadwa@icloud.com', '000026', '2720944689968', 'D61rNNaADa1y', 'BIRTOUTA', 1, NULL, '2026-04-19 12:33:13', NULL),
(32, 'Rechid', 'Lina', 'lina.rechid@gmail.com', '000027', '2820595834118', 'NmVzjiZjMpEj', 'Babezzouar', 1, NULL, '2026-04-19 12:33:13', NULL),
(33, 'ROUCHICHE', 'Nouha', 'rouchichenouha40@gmail.com', '000028', '2900848977426', 'euagtJh1R6fa', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(34, 'Hamouda', 'Abla', 'hamoudaabla.07@gmail.com', '000029', '1820743988855', '5Br2N7Qnu0ib', 'El biar', 1, NULL, '2026-04-19 12:33:13', NULL),
(35, 'BOUAFIA', 'Yasmine', 'bouafiayasmineg3@gmail.com', '000030', '1950316810951', '8PWZFVS8q6KK', 'Birkhadem', 1, NULL, '2026-04-19 12:33:13', NULL),
(36, 'Saioud', 'Zino', 'helloworld30042004@gmail.com', '000031', '1791069532037', '1PSq3u8AKFqG', 'Boumerdes', 1, NULL, '2026-04-19 12:33:13', NULL),
(37, 'Boumali', 'Nihaad', 'nihadboumali49@gmail.com', '000032', '1840197380329', 'r7qby3VslnyY', 'Mohamed belouizdad', 1, NULL, '2026-04-19 12:33:13', NULL),
(38, 'Debza', 'Chahir', 'debzachahir4@gmail.com', '000033', '1710326940897', 's1SXJ4Hvj2BQ', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(39, 'Yahiaoui', 'Ahmed', 'medyahiaoui2005@gmail.com', '000034', '1920998644571', 'r94DcOH3rV9R', 'birkhadem', 1, NULL, '2026-04-19 12:33:13', NULL),
(40, 'hardjani', 'sofia', 'sofialovesmegumi@gmail.com', '000035', '2960685263443', 'j2lD9I5a9Q4b', 'alger', 1, NULL, '2026-04-19 12:33:13', NULL),
(41, 'Khaili', 'Dikra', 'dhikrakhaili07@gmail.com', '000036', '1901160373741', 'XKCqqBfpPg2g', 'Bab Ezzouar', 1, NULL, '2026-04-19 12:33:13', NULL),
(42, 'Chafaa', 'Ines', 'chafaaines28@gmail.com', '000037', '2881048905777', 's4Wyt8vv03dC', 'Ain benian', 1, NULL, '2026-04-19 12:33:13', NULL),
(43, 'AKNIOU', 'Mohamed Achraf', 'aknioumohamedachraf@gmail.com', '000038', '2881141734710', 'GOQjdXrWQE4b', 'Sidiabdelah', 1, NULL, '2026-04-19 12:33:13', NULL),
(44, 'Tsourtatine', 'Amira Nour', 'tsourtatineamiranour@gmail.com', '000039', '1870729631860', 'cYpp46v4tDMN', 'Birtouta', 1, NULL, '2026-04-19 12:33:13', NULL),
(45, 'Daoudi', 'Meriem amira', 'meriemd320@gmail.com', '000040', '4379512356743', 's4Wyt8d9F5t3dC', 'bordj El kiffan', 1, NULL, '2026-04-19 12:33:13', NULL),
(46, 'Zebiri', 'Meriem nibel', 'meriemnibelz@gmail.com', '000041', '1258632567895', 's4Wyt8vght3dC', 'Ain naadja', 1, NULL, '2026-04-19 12:33:13', NULL),
(47, 'Fethallah', 'Racim', 'ricracim@gmail.com', '000042', '1258633527895', 's4WyGthght3dC', 'Didouche', 1, NULL, '2026-04-19 12:33:13', NULL),
(48, 'Fethallah', 'Rabah', 'fethallahrm@gmail.com', '000043', '1258633527887', 'F4WyGthght9dC', 'Didouche', 1, NULL, '2026-04-19 12:33:13', NULL),
(49, 'Krim', 'Djamel', 'dkrim2016@gmail.com', '000045', '12586336387', 'F4Wygqtght9dC', 'Sidi mhamed', 1, NULL, '2026-04-19 12:33:13', NULL),
(50, 'Debza', 'Tahar', 'Tdebza2017@gmail.com', '000046', '12586539687', 'Fgrh9qtght9dC', 'Setif', 1, NULL, '2026-04-19 12:33:13', NULL),
(51, 'Louni', 'Lina', 'lounilina@gmail.com', '000047', '12587253987', 'F4WygqtVyksdC', 'Tilimly', 1, NULL, '2026-04-19 12:33:13', NULL),
(52, 'Madi', 'Ines', 'madiines@gmail.com', '000048', '39286539687', 'Fgrh9qBl3r9dC', 'Messonier', 1, NULL, '2026-04-19 12:33:13', NULL);

-- user_roles
CREATE TABLE `user_roles` (
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `assigned_by` int DEFAULT NULL,
  `assigned_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `user_roles` (`user_id`, `role_id`, `assigned_by`, `assigned_at`) VALUES
(4, 1, NULL, '2026-04-25 14:47:18'),
(4, 2, NULL, '2026-04-25 14:47:18'),
(4, 3, NULL, '2026-04-25 14:47:18'),
(4, 4, NULL, '2026-04-25 14:47:18'),
(5, 1, 4, '2026-04-25 14:47:18'),
(5, 2, 4, '2026-04-25 14:47:18'),
(6, 1, 4, '2026-04-25 14:47:18'),
(7, 1, 4, '2026-04-25 14:47:18'),
(8, 1, 4, '2026-04-25 14:47:18'),
(9, 1, 4, '2026-04-25 14:47:18'),
(10, 1, 4, '2026-04-25 14:47:18'),
(11, 1, 4, '2026-04-25 14:47:18'),
(12, 1, 4, '2026-04-25 14:47:18'),
(13, 1, 4, '2026-04-25 14:47:18'),
(14, 1, 4, '2026-04-25 14:47:18'),
(15, 1, 4, '2026-04-25 14:47:18'),
(16, 1, 4, '2026-04-25 14:47:18'),
(16, 2, NULL, '2026-04-26 15:46:58'),
(17, 1, 4, '2026-04-25 14:47:18'),
(18, 1, 4, '2026-04-25 14:47:18'),
(19, 1, 4, '2026-04-25 14:47:18'),
(19, 4, NULL, '2026-04-26 15:03:18'),
(20, 1, 4, '2026-04-25 14:47:18'),
(21, 1, 4, '2026-04-25 14:47:18'),
(22, 1, 4, '2026-04-25 14:47:18'),
(23, 1, 4, '2026-04-25 14:47:18'),
(24, 1, 4, '2026-04-25 14:47:18'),
(25, 1, 4, '2026-04-25 14:47:18'),
(26, 1, 4, '2026-04-25 14:47:18'),
(27, 1, 4, '2026-04-25 14:47:18'),
(28, 1, 4, '2026-04-25 14:47:18'),
(29, 1, 4, '2026-04-25 14:47:18'),
(30, 1, 4, '2026-04-25 14:47:18'),
(31, 1, 4, '2026-04-25 14:47:18'),
(32, 1, 4, '2026-04-25 14:47:18'),
(33, 1, 4, '2026-04-25 14:47:18'),
(34, 1, 4, '2026-04-25 14:47:18'),
(35, 1, 4, '2026-04-25 14:47:18'),
(36, 1, 4, '2026-04-25 14:47:18'),
(37, 1, 4, '2026-04-25 14:47:18'),
(38, 1, 4, '2026-04-25 14:47:18'),
(39, 1, 4, '2026-04-25 14:47:18'),
(40, 1, 4, '2026-04-25 14:47:18'),
(41, 1, 4, '2026-04-25 14:47:18'),
(42, 1, 4, '2026-04-25 14:47:18'),
(43, 1, 4, '2026-04-25 14:47:18'),
(44, 1, 4, '2026-04-25 14:47:18'),
(45, 1, 4, '2026-04-25 14:47:18'),
(46, 1, 4, '2026-04-25 14:47:18'),
(47, 1, 4, '2026-04-25 14:47:18'),
(48, 1, 4, '2026-04-25 14:47:18'),
(49, 1, 4, '2026-04-25 14:47:18'),
(50, 1, 4, '2026-04-25 14:47:18'),
(51, 1, 4, '2026-04-25 14:47:18'),
(52, 1, 4, '2026-04-25 14:47:18');

CREATE TABLE `withdrawal_requests` (
  `id` int NOT NULL,
  `registration_id` int NOT NULL,
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','PROCESSED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `processed_by` int DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `admin_comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== Primary keys + auto-increment =====
ALTER TABLE `activities` ADD PRIMARY KEY (`id`), ADD KEY `idx_statut` (`status`), ADD KEY `idx_categorie` (`category`);
ALTER TABLE `activity_sessions` ADD PRIMARY KEY (`id`), ADD KEY `idx_session_activite` (`activity_id`), ADD KEY `idx_session_dates` (`start_date`,`end_date`), ADD KEY `idx_session_fin_inscription` (`registration_deadline`), ADD KEY `idx_session_statut` (`status`);
ALTER TABLE `announcements` ADD PRIMARY KEY (`id`), ADD KEY `fk_announcements_created_by` (`created_by`);
ALTER TABLE `audit_logs` ADD PRIMARY KEY (`id`), ADD KEY `idx_audit_user` (`user_id`), ADD KEY `idx_audit_action` (`action`), ADD KEY `idx_audit_date` (`action_date`);
ALTER TABLE `cache` ADD PRIMARY KEY (`key`), ADD KEY `cache_expiration_index` (`expiration`);
ALTER TABLE `cache_locks` ADD PRIMARY KEY (`key`), ADD KEY `cache_locks_expiration_index` (`expiration`);
ALTER TABLE `certificates` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `participation_id` (`participation_id`);
ALTER TABLE `documents` ADD PRIMARY KEY (`document_id`), ADD KEY `fk_doc_requis` (`required_document_id`), ADD KEY `fk_doc_valide_par` (`validated_by`), ADD KEY `idx_doc_inscription` (`registration_id`), ADD KEY `idx_doc_statut` (`status`);
ALTER TABLE `draws` ADD PRIMARY KEY (`draw_id`), ADD KEY `fk_tirage_admin` (`admin_id`), ADD KEY `idx_tirage_session` (`session_id`), ADD KEY `idx_tirage_effectue` (`executed`);
ALTER TABLE `draw_results` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uq_resultat` (`draw_id`,`registration_id`), ADD KEY `fk_rt_session_site` (`session_site_id`), ADD KEY `idx_rt_inscription` (`registration_id`), ADD KEY `idx_rt_selectionne` (`is_selected`), ADD KEY `idx_rt_suppleant` (`is_substitute`,`substitute_rank`);
ALTER TABLE `failed_jobs` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);
ALTER TABLE `ideas` ADD PRIMARY KEY (`id`), ADD KEY `fk_ideas_user` (`user_id`), ADD KEY `fk_ideas_moderator` (`moderated_by`);
ALTER TABLE `jobs` ADD PRIMARY KEY (`id`), ADD KEY `jobs_queue_index` (`queue`);
ALTER TABLE `job_batches` ADD PRIMARY KEY (`id`);
ALTER TABLE `migrations` ADD PRIMARY KEY (`id`);
ALTER TABLE `notifications` ADD PRIMARY KEY (`id`), ADD KEY `fk_notifications_user` (`user_id`), ADD KEY `fk_notifications_created_by` (`created_by`);
ALTER TABLE `official_notes` ADD PRIMARY KEY (`note_id`), ADD KEY `fk_note_user` (`user_id`), ADD KEY `idx_note_statut` (`status`,`published_at`), ADD KEY `idx_note_type` (`type`);
ALTER TABLE `participations` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uq_participation` (`user_id`,`session_site_id`), ADD KEY `fk_part_ss` (`session_site_id`), ADD KEY `idx_part_utilisateur` (`user_id`);
ALTER TABLE `password_reset_tokens` ADD PRIMARY KEY (`email`);
ALTER TABLE `registrations` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uq_inscription` (`user_id`,`session_id`), ADD UNIQUE KEY `reference_number` (`reference_number`), ADD KEY `idx_insc_utilisateur` (`user_id`), ADD KEY `idx_insc_session` (`session_id`), ADD KEY `idx_insc_statut` (`status`), ADD KEY `idx_insc_eligible` (`is_eligible`);
ALTER TABLE `registration_status_history` ADD PRIMARY KEY (`id`), ADD KEY `idx_hist_inscription` (`registration_id`);
ALTER TABLE `required_documents` ADD PRIMARY KEY (`id`), ADD KEY `idx_docreq_activite` (`activity_id`);
ALTER TABLE `roles` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);
ALTER TABLE `sessions` ADD PRIMARY KEY (`id`), ADD KEY `sessions_user_id_index` (`user_id`), ADD KEY `sessions_last_activity_index` (`last_activity`);
ALTER TABLE `session_sites` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uq_session_site` (`session_id`,`site_id`), ADD KEY `idx_ss_session` (`session_id`), ADD KEY `idx_ss_site` (`site_id`);
ALTER TABLE `sites` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);
ALTER TABLE `site_choices` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uq_choix_ordre` (`registration_id`,`choice_order`), ADD UNIQUE KEY `uq_choix_session_site` (`registration_id`,`session_site_id`), ADD KEY `idx_cs_session_site` (`session_site_id`);
ALTER TABLE `substitute_replacements` ADD PRIMARY KEY (`id`), ADD KEY `fk_remp_abandonne` (`abandoned_result_id`), ADD KEY `fk_remp_suppleant` (`substitute_result_id`);
ALTER TABLE `surveys` ADD PRIMARY KEY (`id`), ADD KEY `fk_surveys_created_by` (`created_by`);
ALTER TABLE `survey_options` ADD PRIMARY KEY (`id`), ADD KEY `fk_survey_options_survey` (`survey_id`);
ALTER TABLE `survey_responses` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `uq_survey_user` (`survey_id`,`user_id`), ADD KEY `fk_survey_responses_user` (`user_id`), ADD KEY `fk_survey_responses_option` (`option_id`);
ALTER TABLE `users` ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `email` (`email`), ADD UNIQUE KEY `employee_number` (`employee_number`), ADD UNIQUE KEY `social_security_number` (`social_security_number`), ADD KEY `idx_email` (`email`), ADD KEY `idx_matricule` (`employee_number`), ADD KEY `idx_actif` (`active`);
ALTER TABLE `user_roles` ADD PRIMARY KEY (`user_id`,`role_id`), ADD KEY `fk_ur_attribue_par` (`assigned_by`), ADD KEY `idx_ur_role` (`role_id`);
ALTER TABLE `withdrawal_requests` ADD PRIMARY KEY (`id`), ADD KEY `fk_desistement_traite_par` (`processed_by`), ADD KEY `idx_desistement_inscription` (`registration_id`), ADD KEY `idx_desistement_statut` (`status`);

ALTER TABLE `activities` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
ALTER TABLE `activity_sessions` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `announcements` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `audit_logs` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
ALTER TABLE `certificates` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `documents` MODIFY `document_id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `draws` MODIFY `draw_id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `draw_results` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `failed_jobs` MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `ideas` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `jobs` MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;
ALTER TABLE `migrations` MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `notifications` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `official_notes` MODIFY `note_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `participations` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `registrations` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `registration_status_history` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `required_documents` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `roles` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `session_sites` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
ALTER TABLE `sites` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
ALTER TABLE `site_choices` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `substitute_replacements` MODIFY `id` int NOT NULL AUTO_INCREMENT;
ALTER TABLE `surveys` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
ALTER TABLE `survey_options` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `survey_responses` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
ALTER TABLE `users` MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;
ALTER TABLE `withdrawal_requests` MODIFY `id` int NOT NULL AUTO_INCREMENT;

-- Foreign keys
ALTER TABLE `activity_sessions` ADD CONSTRAINT `fk_session_activite` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `announcements` ADD CONSTRAINT `fk_announcements_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `audit_logs` ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `certificates` ADD CONSTRAINT `fk_cert_participation` FOREIGN KEY (`participation_id`) REFERENCES `participations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `documents` ADD CONSTRAINT `fk_doc_inscription` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_doc_requis` FOREIGN KEY (`required_document_id`) REFERENCES `required_documents` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_doc_valide_par` FOREIGN KEY (`validated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `draws` ADD CONSTRAINT `fk_tirage_admin` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE, ADD CONSTRAINT `fk_tirage_session` FOREIGN KEY (`session_id`) REFERENCES `activity_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `draw_results` ADD CONSTRAINT `fk_rt_inscription` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_rt_session_site` FOREIGN KEY (`session_site_id`) REFERENCES `session_sites` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_rt_tirage` FOREIGN KEY (`draw_id`) REFERENCES `draws` (`draw_id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ideas` ADD CONSTRAINT `fk_ideas_moderator` FOREIGN KEY (`moderated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_ideas_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `notifications` ADD CONSTRAINT `fk_notifications_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `official_notes` ADD CONSTRAINT `fk_note_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `participations` ADD CONSTRAINT `fk_part_ss` FOREIGN KEY (`session_site_id`) REFERENCES `session_sites` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_part_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `registrations` ADD CONSTRAINT `fk_insc_session` FOREIGN KEY (`session_id`) REFERENCES `activity_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_insc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `registration_status_history` ADD CONSTRAINT `fk_hist_inscription` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `required_documents` ADD CONSTRAINT `fk_docreq_activite` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `session_sites` ADD CONSTRAINT `fk_ss_session` FOREIGN KEY (`session_id`) REFERENCES `activity_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_ss_site` FOREIGN KEY (`site_id`) REFERENCES `sites` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `site_choices` ADD CONSTRAINT `fk_cs_inscription` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_cs_session_site` FOREIGN KEY (`session_site_id`) REFERENCES `session_sites` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `substitute_replacements` ADD CONSTRAINT `fk_remp_abandonne` FOREIGN KEY (`abandoned_result_id`) REFERENCES `draw_results` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_remp_suppleant` FOREIGN KEY (`substitute_result_id`) REFERENCES `draw_results` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `surveys` ADD CONSTRAINT `fk_surveys_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `survey_options` ADD CONSTRAINT `fk_survey_options_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `survey_responses` ADD CONSTRAINT `fk_survey_responses_option` FOREIGN KEY (`option_id`) REFERENCES `survey_options` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_survey_responses_survey` FOREIGN KEY (`survey_id`) REFERENCES `surveys` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_survey_responses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_ur_attribue_par` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE, ADD CONSTRAINT `fk_ur_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_ur_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `withdrawal_requests` ADD CONSTRAINT `fk_desistement_inscription` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT `fk_desistement_traite_par` FOREIGN KEY (`processed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

COMMIT;
