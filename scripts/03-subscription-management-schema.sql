-- Migración para implementar sistema de vencimientos mensuales
-- Fecha: 2025-09-03
USE pedi_solutions;

-- Primero agregamos las nuevas columnas a la tabla users
ALTER TABLE users 
ADD COLUMN fecha_inicio_suscripcion DATE AFTER subscription_end,
ADD COLUMN dia_vencimiento INT AFTER fecha_inicio_suscripcion,
ADD COLUMN ultimo_pago DATE AFTER dia_vencimiento,
ADD COLUMN estado_suscripcion ENUM('Activo', 'En deuda', 'En gracia', 'Bloqueado Parcial') DEFAULT 'Activo' AFTER ultimo_pago,
ADD COLUMN fecha_proximo_vencimiento DATE AFTER estado_suscripcion,
ADD COLUMN dias_gracia_restantes INT DEFAULT 0 AFTER fecha_proximo_vencimiento;

-- Creamos tabla de historial de pagos para tracking completo
CREATE TABLE payment_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    fecha_pago DATE NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    metodo_pago ENUM('manual', 'automatico') DEFAULT 'manual',
    periodo_pagado VARCHAR(20), -- ej: "2025-09" 
    estado_anterior ENUM('Activo', 'En deuda', 'En gracia', 'Bloqueado Parcial'),
    estado_nuevo ENUM('Activo', 'En deuda', 'En gracia', 'Bloqueado Parcial'),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Creamos tabla de notificaciones de vencimiento
CREATE TABLE subscription_notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    tipo_notificacion ENUM('preventivo', 'vencimiento', 'gracia', 'suspension') NOT NULL,
    fecha_notificacion DATE NOT NULL,
    dias_restantes INT,
    mensaje TEXT,
    enviada BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimización
CREATE INDEX idx_users_estado_suscripcion ON users(estado_suscripcion);
CREATE INDEX idx_users_fecha_proximo_vencimiento ON users(fecha_proximo_vencimiento);
CREATE INDEX idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX idx_payment_history_fecha_pago ON payment_history(fecha_pago);
CREATE INDEX idx_subscription_notifications_user_id ON subscription_notifications(user_id);
CREATE INDEX idx_subscription_notifications_fecha_notificacion ON subscription_notifications(fecha_notificacion);
