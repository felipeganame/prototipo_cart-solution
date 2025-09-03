-- Actualización del sistema de pagos y planes - Versión manual
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

-- Ver qué columnas ya existen
DESCRIBE users;
