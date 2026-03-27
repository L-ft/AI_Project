-- RBAC 权限系统增强版
USE ai_automation_db;

-- 1. 菜单与按钮表
CREATE TABLE `sys_menus` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `parent_id` INT DEFAULT 0 COMMENT '父级ID',
    `title` VARCHAR(50) NOT NULL COMMENT '菜单标题',
    `type` ENUM('MENU', 'BUTTON') DEFAULT 'MENU' COMMENT '类型',
    `permission_key` VARCHAR(100) UNIQUE COMMENT '权限标识(如 project:add)',
    `api_path` VARCHAR(255) COMMENT '后端接口路径正则',
    `sort` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. 角色-菜单关联表 (核心权限矩阵)
CREATE TABLE `sys_role_menu` (
    `role_id` INT NOT NULL,
    `menu_id` INT NOT NULL,
    PRIMARY KEY (`role_id`, `menu_id`),
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`menu_id`) REFERENCES `sys_menus`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. 操作审计日志表
CREATE TABLE `sys_operation_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `username` VARCHAR(50),
    `action` VARCHAR(100) NOT NULL COMMENT '动作描述',
    `target` VARCHAR(100) COMMENT '操作对象',
    `params` JSON COMMENT '请求参数',
    `ip` VARCHAR(50),
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB;

-- 初始化基础权限数据
INSERT INTO `sys_menus` (id, parent_id, title, type, permission_key, api_path) VALUES 
(1, 0, '接口管理', 'MENU', 'api:mgmt', '/api/.*'),
(2, 1, '新增接口', 'BUTTON', 'api:add', '/api/create'),
(3, 1, '删除接口', 'BUTTON', 'api:delete', '/api/delete/.*'),
(4, 0, '执行报告', 'MENU', 'report:view', '/reports/.*'),
(5, 0, '权限管理', 'MENU', 'sys:rbac', '/rbac/.*');
