-- Script para separar street_address en street_name y street_number
-- Separar dirección: nombre de la calle y número

USE pedi_solutions;

-- Verificar estructura actual de la tabla stores
DESCRIBE stores;

-- Agregar nuevos campos separados para calle y número
ALTER TABLE stores 
ADD COLUMN street_name VARCHAR(200) AFTER postal_code,
ADD COLUMN street_number VARCHAR(50) AFTER street_name;

-- Actualizar street_address a street_name para compatibilidad (por ahora)
-- En producción, aquí implementarías lógica para separar automáticamente
UPDATE stores 
SET street_name = street_address 
WHERE street_address IS NOT NULL AND street_address != '';

-- Crear índices para búsquedas de direcciones
CREATE INDEX idx_stores_street_name ON stores(street_name);
CREATE INDEX idx_stores_street_number ON stores(street_number);

-- Ver estructura actualizada
DESCRIBE stores;

-- Mostrar resumen de la migración
SELECT 
    COUNT(*) as total_stores,
    SUM(CASE WHEN street_name IS NOT NULL AND street_name != '' THEN 1 ELSE 0 END) as stores_with_street_name,
    SUM(CASE WHEN street_number IS NOT NULL AND street_number != '' THEN 1 ELSE 0 END) as stores_with_street_number,
    SUM(CASE WHEN street_address IS NOT NULL AND street_address != '' THEN 1 ELSE 0 END) as stores_with_old_address
FROM stores;

-- Nota: El campo street_address se mantiene por compatibilidad, 
-- pero ahora se recomienda usar street_name y street_number por separado
