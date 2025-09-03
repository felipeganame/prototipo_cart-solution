-- Insertando datos iniciales: planes y usuarios predefinidos
USE pedi_solutions;

-- Insertar planes de usuario
INSERT INTO user_plans (name, price, max_stores, max_products_per_store, max_categories_per_store, features) VALUES
('Básico', 9.99, 1, 50, 10, '{"analytics": false, "custom_branding": false, "priority_support": false}'),
('Profesional', 19.99, 3, 200, 25, '{"analytics": true, "custom_branding": false, "priority_support": false}'),
('Premium', 39.99, 999, 999, 999, '{"analytics": true, "custom_branding": true, "priority_support": true}');

-- Insertar usuario admin
INSERT INTO users (email, password_hash, role, plan_id, company_name, first_name, last_name, is_active, subscription_start, subscription_end, payment_status) VALUES
('admin@pedisolution.com', '$2b$10$rQZ8kHp4rQZ8kHp4rQZ8kOuJ8kHp4rQZ8kHp4rQZ8kHp4rQZ8kHp4r', 'admin', 3, 'Pedi Solutions', 'Admin', 'User', TRUE, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'paid');

-- Insertar usuario regular
INSERT INTO users (email, password_hash, role, plan_id, company_name, first_name, last_name, is_active, subscription_start, subscription_end, payment_status) VALUES
('user@pedisolution.com', '$2b$10$rQZ8kHp4rQZ8kHp4rQZ8kOuJ8kHp4rQZ8kHp4rQZ8kHp4rQZ8kHp4r', 'user', 2, 'Mi Licorería', 'Usuario', 'Demo', TRUE, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 MONTH), 'paid');

-- user@pedisolution.com --> password123
-- admin@pedisolution.com --> password123