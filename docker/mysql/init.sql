CREATE DATABASE IF NOT EXISTS ai_automation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_automation_db;

-- 1. 租户表 (Multi-tenancy)
CREATE TABLE `tenants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `plan` ENUM('FREE', 'PRO', 'ENTERPRISE') DEFAULT 'FREE',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 用户表 (增加 tenant_id)
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'DEV', 'TESTER') DEFAULT 'TESTER',
    `status` TINYINT DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`)
);

-- 3. API Key 管理表
CREATE TABLE `user_api_keys` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `tenant_id` INT NOT NULL,
    `api_key` VARCHAR(64) NOT NULL UNIQUE,
    `name` VARCHAR(50),
    `is_active` BOOLEAN DEFAULT TRUE,
    `last_used_at` TIMESTAMP NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`)
);

-- 4. 资产概览辅助表 (示例：接口与执行记录)
CREATE TABLE `projects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `owner_id` INT,
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`),
    FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`)
);

-- 初始化数据
INSERT INTO `tenants` (`name`, `plan`) VALUES ('Default Tenant', 'ENTERPRISE');
-- 初始管理员 (密码: admin123)
INSERT INTO `users` (tenant_id, username, email, password_hash, role) VALUES (1, 'admin', 'admin@ai.com', '$2b$10$EpjXWzO2yzcaE0B5W7H.vO7N9Z6QJ1W1W1W1W1W1W1W1W1W1W1W1W', 'ADMIN');
