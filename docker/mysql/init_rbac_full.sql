-- Step 1: 强力锁定 UTF8 编码
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET character_set_client = utf8mb4;

CREATE DATABASE IF NOT EXISTS ai_automation_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_automation_db;

-- 0. 租户表
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. 角色表
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL,
    `code` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. 菜单表
DROP TABLE IF EXISTS `sys_menus`;
CREATE TABLE `sys_menus` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` INT DEFAULT 0,
    `title` VARCHAR(50) NOT NULL,
    `type` ENUM('MENU', 'BUTTON') NOT NULL,
    `permission_key` VARCHAR(100) UNIQUE,
    `api_path` VARCHAR(255),
    `sort` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 用户表
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tenant_id` INT NOT NULL,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `email` VARCHAR(100),
    `password_hash` VARCHAR(255) NOT NULL,
    `role_id` INT DEFAULT 3,
    `status` INT DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tenant` (`tenant_id`),
    INDEX `idx_role` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. 角色菜单关联表
DROP TABLE IF EXISTS `sys_role_menu`;
CREATE TABLE `sys_role_menu` (
    `role_id` INT NOT NULL,
    `menu_id` INT NOT NULL,
    PRIMARY KEY (`role_id`, `menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. 插入核心数据
-- 插入默认租户
INSERT INTO `tenants` (id, name) VALUES (1, '默认企业');

-- 插入角色 (使用十六进制)
-- '管理员' -> E7AEA1E7A086E59198
-- '开发者' -> E5BC80E58F91E88085
-- '测试者' -> E6B58BE8AF95E88085
INSERT INTO `roles` (id, name, code) VALUES 
(1, UNHEX('E7AEA1E7A086E59198'), 'ADMIN'), 
(2, UNHEX('E5BC80E58F91E88085'), 'DEV'), 
(3, UNHEX('E6B58BE8AF95E88085'), 'TESTER');

-- 插入菜单 (使用十六进制)
INSERT INTO `sys_menus` (id, parent_id, title, type, permission_key, api_path) VALUES 
(1, 0, UNHEX('E68EA5E58FA3E7AEA1E79086'), 'MENU', 'api:mgmt', '^/api/.*'),
(2, 1, UNHEX('E696B0E5A29EE68EA5E58FA3'), 'BUTTON', 'api:add', '^/api/create$'),
(3, 1, UNHEX('E588A0E999A4E68EA5E58FA3'), 'BUTTON', 'api:delete', '^/api/delete/.*'),
(4, 0, UNHEX('E689A1E8A18CE68AA5E5918A'), 'MENU', 'report:view', '/reports/.*'),
(5, 0, UNHEX('E8AEA4E8AF81E4B8ADE5BF83'), 'MENU', 'sys:auth', '^/auth/.*'),
(6, 5, UNHEX('E8A792E889B2E7AEA1E79086'), 'MENU', 'sys:role', '^/rbac/.*'),
(7, 5, UNHEX('E794A8E680B7E7AEA1E79086'), 'MENU', 'sys:user', '^/users/.*');

-- 插入超管账号 (18681021054 / admin123)
-- '超级管理员' -> E8B685E7BAA7E7AEA1E79086E59198
INSERT INTO `users` (`id`, `tenant_id`, `username`, `phone_number`, `password_hash`, `role_id`) VALUES 
(1, 1, UNHEX('E8B685E7BAA7E7AEA1E79086E59198'), '18681021054', '$2b$10$tB8LzhrHucqjaTV6TUDwYuLyAKFg6tgK11Cr/sz1EKm83LRIZq6vC', 1);

-- 默认给管理员分配所有权限
INSERT INTO `sys_role_menu` (role_id, menu_id) VALUES (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7);
