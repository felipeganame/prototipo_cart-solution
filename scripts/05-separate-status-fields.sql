-- Script para separar el estado en dos campos independientes
-- 1. account_status: activo/inactivo (reemplaza deshabilitado)
-- 2. payment_status: al_dia/en_deuda

USE pedi_solutions;

-- Agregar nuevo campo account_status
ALTER TABLE users 
ADD COLUMN account_status ENUM('activo', 'inactivo') DEFAULT 'activo' AFTER is_active;

-- Migrar datos existentes basándose en payment_status actual
-- Si payment_status es 'deshabilitado', cuenta será 'inactivo'
UPDATE users 
SET account_status = CASE 
    WHEN payment_status = 'deshabilitado' THEN 'inactivo'
    ELSE 'activo'
END;

-- Cambiar payment_status para solo manejar al_dia/en_deuda
-- Primero actualizar los valores 'deshabilitado' a 'en_deuda'
UPDATE users 
SET payment_status = 'en_deuda' 
WHERE payment_status = 'deshabilitado';

-- Modificar el enum de payment_status para remover 'deshabilitado'
ALTER TABLE users 
MODIFY COLUMN payment_status ENUM('al_dia', 'en_deuda') DEFAULT 'en_deuda';

-- Actualizar el trigger para manejar los nuevos campos
DROP TRIGGER IF EXISTS update_days_overdue;

DELIMITER //
CREATE TRIGGER update_payment_and_account_status
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    -- Calcular días de retraso
    IF NEW.next_payment_due IS NOT NULL AND NEW.next_payment_due < CURDATE() THEN
        SET NEW.days_overdue = DATEDIFF(CURDATE(), NEW.next_payment_due);
        
        -- Si tiene más de 7 días de retraso, desactivar cuenta
        IF NEW.days_overdue > 7 THEN
            SET NEW.account_status = 'inactivo';
            SET NEW.payment_status = 'en_deuda';
        ELSEIF NEW.days_overdue > 0 THEN
            -- Entre 1-7 días: cuenta activa pero en deuda
            SET NEW.account_status = 'activo';
            SET NEW.payment_status = 'en_deuda';
        END IF;
    ELSE
        -- Pagos al día
        SET NEW.days_overdue = 0;
        SET NEW.payment_status = 'al_dia';
        -- Solo reactivar cuenta si se paga (no modificar si está inactivo por otros motivos)
        IF OLD.account_status = 'inactivo' AND OLD.days_overdue > 0 THEN
            SET NEW.account_status = 'activo';
        END IF;
    END IF;
END//
DELIMITER ;

-- Crear índices para los nuevos campos
CREATE INDEX idx_users_account_status ON users(account_status);

-- Actualizar el índice existente de payment_status (se mantiene)
-- CREATE INDEX idx_users_payment_status ON users(payment_status); -- Ya existe

-- Mostrar resumen de la migración
SELECT 
    account_status,
    payment_status,
    COUNT(*) as total_users
FROM users 
GROUP BY account_status, payment_status
ORDER BY account_status, payment_status;
