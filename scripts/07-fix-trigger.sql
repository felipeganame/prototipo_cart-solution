-- Arreglar el trigger para no interferir con actualizaciones manuales del admin
USE pedi_solutions;

-- Eliminar el trigger actual
DROP TRIGGER IF EXISTS update_payment_and_account_status;

-- Crear un trigger mejorado que solo actúe automáticamente
DELIMITER //
CREATE TRIGGER update_payment_and_account_status
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
    -- Solo ejecutar la lógica automática si se está actualizando next_payment_due
    -- o si es una actualización del sistema (no manual del admin)
    IF NEW.next_payment_due != OLD.next_payment_due OR NEW.last_payment_date != OLD.last_payment_date THEN
        -- Calcular días de retraso basado en next_payment_due
        IF NEW.next_payment_due IS NOT NULL AND NEW.next_payment_due < CURDATE() THEN
            SET NEW.days_overdue = DATEDIFF(CURDATE(), NEW.next_payment_due);
            
            -- Si tiene más de 7 días de retraso, desactivar cuenta automáticamente
            IF NEW.days_overdue > 7 THEN
                SET NEW.account_status = 'inactivo';
                SET NEW.payment_status = 'en_deuda';
            ELSEIF NEW.days_overdue > 0 THEN
                -- Entre 1-7 días: mantener cuenta activa pero marcar en deuda
                -- Solo cambiar si no está siendo actualizado manualmente
                IF NEW.account_status = OLD.account_status THEN
                    SET NEW.payment_status = 'en_deuda';
                END IF;
            END IF;
        ELSE
            -- Pagos al día
            SET NEW.days_overdue = 0;
            -- Solo actualizar payment_status si no se está cambiando manualmente
            IF NEW.payment_status = OLD.payment_status THEN
                SET NEW.payment_status = 'al_dia';
            END IF;
        END IF;
    END IF;
END//
DELIMITER ;

-- Verificar que el trigger se creó correctamente
SHOW TRIGGERS LIKE 'users';
