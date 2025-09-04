# Database Setup Instructions

## Configuración Completa de la Base de Datos

### 📋 **Archivo Principal:**
- **`pedi_solutions_dump.sql`** - Dump completo con toda la estructura y datos

### 🚀 **Instalación desde cero:**

```bash
# 1. Crear la base de datos (si no existe)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS pedi_solutions;"

# 2. Importar el dump completo
mysql -u root -p pedi_solutions < scripts/pedi_solutions_dump.sql
```

### 🔧 **Características incluidas:**

#### **Tablas principales:**
- ✅ `users` - Usuarios con estados separados (account_status, payment_status)
- ✅ `stores` - Tiendas con direcciones normalizadas (street_name, street_number)
- ✅ `payment_records` - Sistema de pagos completo
- ✅ `user_plans` - Planes de suscripción
- ✅ `categories` - Categorías de productos
- ✅ `products` - Productos
- ✅ `orders` - Sistema de pedidos

#### **Características avanzadas:**
- ✅ Triggers automáticos para manejo de estados
- ✅ Índices optimizados para rendimiento
- ✅ Relaciones FK completas
- ✅ Datos de ejemplo listos para usar

#### **Datos incluidos:**
- 👤 **Usuario Admin:** admin@pedisolution.com / (password: admin123)
- 👤 **Usuario Demo:** user@pedisolution.com / (password: user123)
- 🏪 **Tienda de ejemplo:** "La tienda de Mario"
- 💰 **Planes:** Básico ($9.99), Profesional ($19.99), Premium ($39.99)

### 📝 **Notas importantes:**
- El dump incluye todas las mejoras implementadas hasta septiembre 2025
- Los campos de dirección están separados (street_name, street_number)
- Los estados de usuario están separados (account_status, payment_status)
- El sistema de pagos está completamente funcional

### 🔄 **Para actualizar una DB existente:**
Si ya tienes datos importantes, contacta al desarrollador para un script de migración personalizado.
