-- Migración para hacer opcional el campo icon en la tabla categories
-- Ejecutar este script en tu base de datos MySQL

ALTER TABLE categories 
MODIFY COLUMN icon VARCHAR(10) NULL DEFAULT NULL;

-- Opcional: Si quieres eliminar completamente el campo icon, descomenta la siguiente línea:
-- ALTER TABLE categories DROP COLUMN icon;
