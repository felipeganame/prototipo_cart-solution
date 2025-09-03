-- Actualización del sistema de pagos y planes - Versión segura
USE pedi_solutions;

-- Crear tabla de registros de pagos
CREATE TABLE IF NOT EXISTS payment_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('admin', 'credit_card', 'paypal', 'bank_transfer') DEFAULT 'admin',
    payment_details JSON,
    created_by_admin BOOLEAN DEFAULT TRUE,
    admin_id INT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Primero agregar las nuevas columnas sin borrar las existentes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS monthly_payment DECIMAL(10,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS max_stores INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_payment_due DATE,
ADD COLUMN IF NOT EXISTS days_overdue INT DEFAULT 0;

-- Actualizar usuarios existentes con valores por defecto
UPDATE users 
SET 
    monthly_payment = COALESCE(monthly_payment, 20.00),
    max_stores = COALESCE(max_stores, 1),
    next_payment_due = COALESCE(next_payment_due, DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
    days_overdue = COALESCE(days_overdue, 0)
WHERE role = 'user';

-- Cambiar los valores de payment_status gradualmente
UPDATE users SET payment_status = 'paid' WHERE payment_status = 'al_dia' OR payment_status IS NULL;
UPDATE users SET payment_status = 'overdue' WHERE payment_status = 'en_deuda';
UPDATE users SET payment_status = 'pending' WHERE payment_status = 'deshabilitado';

-- Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date ON payment_records(payment_date);
CREATE INDEX IF NOT EXISTS idx_users_next_payment_due ON users(next_payment_due);
CREATE INDEX IF NOT EXISTS idx_users_payment_status ON users(payment_status);
