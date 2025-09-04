-- Script seguro para separar el estado en dos campos independientes
-- Incluye validaciones y manejo de errores

USE pedi_solutions;

-- Primero verificar si ya existe la columna account_status
SELECT COUNT(*) as column_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'pedi_solutions' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'account_status';

-- Agregar nuevo campo account_status solo si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = 'pedi_solutions' 
       AND TABLE_NAME = 'users' 
       AND COLUMN_NAME = 'account_status') = 0,
    'ALTER TABLE users ADD COLUMN account_status ENUM(\'activo\', \'inactivo\') DEFAULT \'activo\' AFTER is_active',
    'SELECT "account_status column already exists" as message'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar datos actuales en payment_status
SELECT DISTINCT payment_status, COUNT(*) as count 
FROM users 
GROUP BY payment_status;

-- Migrar datos existentes basándose en payment_status actual
-- Si payment_status es 'deshabilitado', cuenta será 'inactivo'
UPDATE users 
SET account_status = CASE 
    WHEN payment_status = 'deshabilitado' THEN 'inactivo'
    WHEN payment_status = 'overdue' THEN 'inactivo'
    WHEN is_active = FALSE THEN 'inactivo'
    ELSE 'activo'
END
WHERE account_status IS NULL OR account_status = '';

-- Actualizar payment_status para cambiar valores incompatibles
UPDATE users 
SET payment_status = CASE 
    WHEN payment_status = 'deshabilitado' THEN 'en_deuda'
    WHEN payment_status = 'overdue' THEN 'en_deuda'
    WHEN payment_status = 'pending' THEN 'en_deuda'
    WHEN payment_status = 'paid' THEN 'al_dia'
    ELSE payment_status
END
WHERE payment_status NOT IN ('al_dia', 'en_deuda');

-- Verificar que todos los valores son válidos antes de cambiar el enum
SELECT 'Values after migration:' as status;
SELECT DISTINCT payment_status, COUNT(*) as count 
FROM users 
GROUP BY payment_status;

-- Ahora cambiar el enum de payment_status de forma segura
-- Primero crear una columna temporal
ALTER TABLE users ADD COLUMN payment_status_new ENUM('al_dia', 'en_deuda') DEFAULT 'en_deuda';

-- Copiar valores válidos
UPDATE users 
SET payment_status_new = CASE 
    WHEN payment_status = 'al_dia' THEN 'al_dia'
    ELSE 'en_deuda'
END;

-- Eliminar la columna antigua y renombrar la nueva
ALTER TABLE users DROP COLUMN payment_status;
ALTER TABLE users CHANGE payment_status_new payment_status ENUM('al_dia', 'en_deuda') DEFAULT 'en_deuda';

-- Actualizar el trigger para manejar los nuevos campos
DROP TRIGGER IF EXISTS update_days_overdue;
DROP TRIGGER IF EXISTS update_payment_and_account_status;

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

-- Mostrar resumen de la migración
SELECT 'Migration completed successfully!' as status;
SELECT 
    account_status,
    payment_status,
    COUNT(*) as total_users
FROM users 
GROUP BY account_status, payment_status
ORDER BY account_status, payment_status;
