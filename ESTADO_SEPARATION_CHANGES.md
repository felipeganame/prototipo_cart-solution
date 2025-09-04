# Separación de Estados - Sistema de Facturación por Tiendas

## Cambios Implementados

### 1. Base de Datos (✅ Completado)
- **Nueva columna**: `account_status` ENUM('activo', 'inactivo')
- **Columna modificada**: `payment_status` ENUM('al_dia', 'en_deuda') - removido 'deshabilitado'
- **Migración de datos**: Valores antiguos migrados correctamente
- **Trigger actualizado**: Manejo automático de estados basado en fechas de pago

### 2. APIs Backend (✅ Completado)
- **Stats API**: `/api/admin/stats/route.ts` - Actualizado para usar nuevos campos
- **Users API**: `/api/admin/users/route.ts` - Incluye `account_status` en consultas
- **User Update API**: `/api/admin/users/[userId]/route.ts` - Manejo de ambos estados por separado

### 3. Frontend - Dashboard Admin (✅ Completado)
- **Estadísticas**: Cambiado "Usuarios Deshabilitados" por "Cuentas Inactivas"
- **Lista de usuarios**: Nueva columna "Estado Cuenta" separada de "Estado Pago"
- **Acciones**: Botones para activar/desactivar cuentas independientemente del pago
- **Filtros**: Agregados filtros por estado de cuenta (activo/inactivo)

### 4. Tipos TypeScript (✅ Completado)
- **Interface User**: Actualizada con `account_status` y nuevos valores de `payment_status`

## Estados Separados

### Estado de Cuenta (account_status)
- **activo**: La cuenta está habilitada para usar el sistema
- **inactivo**: La cuenta está deshabilitada (por admin o por >7 días de retraso)

### Estado de Pago (payment_status)  
- **al_dia**: Los pagos están al corriente
- **en_deuda**: Hay pagos atrasados

## Lógica Automática
- **0 días de retraso**: `payment_status = 'al_dia'`
- **1-7 días de retraso**: `account_status = 'activo'`, `payment_status = 'en_deuda'`
- **>7 días de retraso**: `account_status = 'inactivo'`, `payment_status = 'en_deuda'`
- **Pago realizado**: Se reactiva automáticamente la cuenta si estaba inactiva por deuda

## Controles del Admin
- **Marcar como pagado**: Actualiza estado de pago y reactiva cuenta
- **Activar/Desactivar cuenta**: Control manual independiente del estado de pago
- **Filtros separados**: Ver usuarios por estado de cuenta o estado de pago

## Estado de la Migración
✅ **Base de datos migrada exitosamente**
- 2 usuarios con `account_status = 'activo'` y `payment_status = 'al_dia'`  
- 1 usuario con `account_status = 'activo'` y `payment_status = 'en_deuda'`
- 2 usuarios con `account_status = 'inactivo'` y `payment_status = 'en_deuda'`

## Pendiente
🔄 **Revisar que las funciones del dashboard funcionen correctamente** (segunda foto de la captura)
🔄 **Normalización de direcciones** y **arreglo de creación de tiendas**
