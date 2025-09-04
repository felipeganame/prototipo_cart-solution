-- Script para normalizar direcciones en la base de datos
USE pedi_solutions;

-- Primero agregar las nuevas columnas de dirección normalizada
ALTER TABLE stores 
ADD COLUMN country VARCHAR(100),
ADD COLUMN state_province VARCHAR(100),
ADD COLUMN city VARCHAR(100),
ADD COLUMN postal_code VARCHAR(20),
ADD COLUMN street_address TEXT;

-- Actualizar tiendas existentes - migrar dirección actual al nuevo campo
UPDATE stores 
SET street_address = address,
    country = 'Colombia',
    city = 'No especificado'
WHERE address IS NOT NULL AND address != '';

-- Crear índices para búsquedas geográficas
CREATE INDEX idx_stores_country ON stores(country);
CREATE INDEX idx_stores_state_province ON stores(state_province);
CREATE INDEX idx_stores_city ON stores(city);
CREATE INDEX idx_stores_postal_code ON stores(postal_code);
