-- Actualización del sistema de pagos y planes
USE pedi_solutions;

-- Crear tabla de registros de pagos
CREATE TABLE payment_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('admin', 'credit_card', 'paypal', 'bank_transfer') DEFAULT 'admin',
    payment_details JSON, -- Para almacenar últimos dígitos de tarjeta, referencia, etc.
    created_by_admin BOOLEAN DEFAULT TRUE,
    admin_id INT, -- ID del admin que registró el pago
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Modificar tabla de usuarios para el nuevo sistema de pagos por tiendas
ALTER TABLE users 
DROP FOREIGN KEY users_ibfk_1,
DROP COLUMN plan_id,
ADD COLUMN monthly_payment DECIMAL(10,2) DEFAULT 20.00,
ADD COLUMN max_stores INT DEFAULT 1,
ADD COLUMN next_payment_due DATE,
ADD COLUMN days_overdue INT DEFAULT 0,
MODIFY COLUMN payment_status ENUM('al_dia', 'en_deuda', 'deshabilitado') DEFAULT 'en_deuda';

-- Eliminar tabla de planes ya que no la necesitamos
DROP TABLE user_plans;

-- Crear índices para optimización
CREATE INDEX idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX idx_users_next_payment_due ON users(next_payment_due);
CREATE INDEX idx_users_payment_status ON users(payment_status);

-- Crear trigger para actualizar días de retraso automáticamente
DELIMITER //
CREATE TRIGGER update_days_overdue 
BEFORE UPDATE ON users 
FOR EACH ROW 
BEGIN
    IF NEW.next_payment_due IS NOT NULL AND NEW.next_payment_due < CURDATE() THEN
        SET NEW.days_overdue = DATEDIFF(CURDATE(), NEW.next_payment_due);
        IF NEW.days_overdue > 7 THEN
            SET NEW.payment_status = 'deshabilitado';
        ELSEIF NEW.days_overdue > 0 THEN
            SET NEW.payment_status = 'en_deuda';
        END IF;
    ELSE
        SET NEW.days_overdue = 0;
        IF NEW.payment_status != 'deshabilitado' THEN
            SET NEW.payment_status = 'al_dia';
        END IF;
    END IF;
END//
DELIMITER ;

-- Crear función para calcular el máximo de tiendas según el pago mensual
DELIMITER //
CREATE FUNCTION calculate_max_stores(monthly_payment DECIMAL(10,2)) 
RETURNS INT
READS SQL DATA
DETERMINISTIC
BEGIN
    RETURN FLOOR(monthly_payment / 10);
END//
DELIMITER ;

-- Actualizar usuarios existentes con el nuevo sistema
UPDATE users 
SET 
    monthly_payment = 20.00,
    max_stores = 1,
    next_payment_due = DATE_ADD(CURDATE(), INTERVAL 30 DAY),
    payment_status = 'al_dia'
WHERE role = 'user';
