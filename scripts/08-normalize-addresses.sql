-- Script para normalizar direcciones en campos atómicos
-- Agregar campos separados: país, estado/provincia, ciudad, código postal, dirección

USE pedi_solutions;

-- Verificar estructura actual de la tabla stores
DESCRIBE stores;

-- Agregar nuevos campos de dirección atomizada
ALTER TABLE stores 
ADD COLUMN country VARCHAR(100) AFTER address,
ADD COLUMN state_province VARCHAR(100) AFTER country,
ADD COLUMN city VARCHAR(100) AFTER state_province,
ADD COLUMN postal_code VARCHAR(20) AFTER city,
ADD COLUMN street_address VARCHAR(255) AFTER postal_code;

-- Migrar direcciones existentes (simple - mantener en street_address por ahora)
UPDATE stores 
SET street_address = address 
WHERE address IS NOT NULL AND address != '';

-- Crear índices para búsquedas geográficas
CREATE INDEX idx_stores_country ON stores(country);
CREATE INDEX idx_stores_state_province ON stores(state_province);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_postal_code ON stores(postal_code);

-- Ver estructura actualizada
DESCRIBE stores;

-- Mostrar resumen de la migración
SELECT 
    COUNT(*) as total_stores,
    SUM(CASE WHEN street_address IS NOT NULL AND street_address != '' THEN 1 ELSE 0 END) as stores_with_address,
    SUM(CASE WHEN country IS NOT NULL AND country != '' THEN 1 ELSE 0 END) as stores_with_country,
    SUM(CASE WHEN city IS NOT NULL AND city != '' THEN 1 ELSE 0 END) as stores_with_city
FROM stores;
