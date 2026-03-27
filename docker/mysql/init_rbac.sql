-- AI 自动化平台 核心数据库初始化脚本 (RBAC v2 + 手机号登录)
CREATE DATABASE IF NOT EXISTS ai_automation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_automation_db;

-- 1. 租户表
CREATE TABLE `tenants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. 角色表
CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(20) NOT NULL UNIQUE COMMENT 'ADMIN, DEV, TESTER',
    `description` VARCHAR(255)
) ENGINE=InnoDB;

-- 3. 用户表
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT NOT NULL,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` INT NOT NULL,
    `status` TINYINT DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tenant_phone` (`tenant_id`, `phone_number`),
    FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
) ENGINE=InnoDB;

-- 4. 菜单与权限点表
CREATE TABLE `sys_menus` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` INT DEFAULT 0,
    `title` VARCHAR(50) NOT NULL,
    `type` ENUM('MENU', 'BUTTON') NOT NULL,
    `permission_key` VARCHAR(100) UNIQUE,
    `api_path` VARCHAR(255),
    `sort` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. 角色-菜单关联表
CREATE TABLE `sys_role_menu` (
    `role_id` INT NOT NULL,
    `menu_id` INT NOT NULL,
    PRIMARY KEY (`role_id`, `menu_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`menu_id`) REFERENCES `sys_menus`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. 用户资产概览表
CREATE TABLE `user_assets` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL UNIQUE,
    `api_count` INT DEFAULT 0,
    `task_count` INT DEFAULT 0,
    `success_rate` DECIMAL(5,2) DEFAULT 0.00,
    `api_key` VARCHAR(64) UNIQUE,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------
-- 初始种子数据
-- ----------------------------

-- 插入角色
INSERT INTO `roles` (`id`, `name`, `code`) VALUES 
(1, '管理员', 'ADMIN'), 
(2, '开发者', 'DEV'), 
(3, '测试者', 'TESTER');

-- 插入租户
INSERT INTO `tenants` (`id`, `name`) VALUES (1, '默认租户');

-- 插入初始用户 (手机号: 18681021052, 密码: 123123)
-- bcrypt hash for '123123'
INSERT INTO `users` (`tenant_id`, `username`, `phone_number`, `password_hash`, `role_id`) VALUES 
(1, 'test_admin', '18681021052', '$2b$10$EpjXWzO2yzcaE0B5W7H.vO7N9Z6QJ1W1W1W1W1W1W1W1W1W1W1W1W', 1);

-- 插入菜单
INSERT INTO `sys_menus` (id, parent_id, title, type, permission_key, api_path) VALUES 
(1, 0, '接口管理', 'MENU', 'api:mgmt', '^/api/.*'),
(2, 1, '新增接口', 'BUTTON', 'api:add', '^/api/create$'),
(3, 1, '删除接口', 'BUTTON', 'api:delete', '^/api/delete/.*'),
(4, 0, '执行报告', 'MENU', 'report:view', '^/reports/.*'),
(5, 0, '权限管理', 'MENU', 'sys:rbac', '^/rbac/.*');

-- 初始化管理员全量权限
INSERT INTO `sys_role_menu` (role_id, menu_id) SELECT 1, id FROM sys_menus;

-- 初始化资产
INSERT INTO `user_assets` (`user_id`, `api_key`) VALUES (1, 'ai_admin_master_key_2026');
