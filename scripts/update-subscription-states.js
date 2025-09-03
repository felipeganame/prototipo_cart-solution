#!/usr/bin/env node

/**
 * Script para actualizar automáticamente los estados de suscripción
 * Se puede ejecutar como cron job o manualmente
 * 
 * Uso:
 * node scripts/update-subscription-states.js
 * 
 * Para cron job (ejecutar diariamente a las 00:01):
 * 1 0 * * * cd /path/to/project && node scripts/update-subscription-states.js
 */

const mysql = require("mysql2/promise")
require("dotenv").config()

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pedi_solutions",
  port: parseInt(process.env.DB_PORT || "3306"),
}

class SubscriptionUpdater {
  constructor() {
    this.connection = null
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection(dbConfig)
      console.log("✅ Conectado a la base de datos")
    } catch (error) {
      console.error("❌ Error conectando a la base de datos:", error)
      throw error
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end()
      console.log("✅ Desconectado de la base de datos")
    }
  }

  async updateSubscriptionStates() {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      console.log(`🔄 Actualizando estados de suscripción para fecha: ${hoy}`)
      
      // Obtener usuarios que necesitan actualización de estado
      const [users] = await this.connection.execute(
        `SELECT id, email, estado_suscripcion, fecha_proximo_vencimiento, 
         dias_gracia_restantes FROM users 
         WHERE fecha_proximo_vencimiento IS NOT NULL 
         AND role = 'user'`
      )

      let updatedCount = 0
      const stats = {
        activos: 0,
        enDeuda: 0,
        enGracia: 0,
        bloqueados: 0
      }

      for (const user of users) {
        const fechaVencimiento = new Date(user.fecha_proximo_vencimiento)
        const fechaHoy = new Date(hoy)
        
        const diasDiferencia = Math.floor((fechaHoy.getTime() - fechaVencimiento.getTime()) / (1000 * 60 * 60 * 24))
        
        let nuevoEstado = user.estado_suscripcion
        let diasGraciaRestantes = user.dias_gracia_restantes

        if (diasDiferencia >= 0) { // Ya venció o es hoy
          if (diasDiferencia === 0 && user.estado_suscripcion === 'Activo') {
            // Día de vencimiento
            nuevoEstado = 'En deuda'
            diasGraciaRestantes = 7
          } else if (diasDiferencia > 0 && diasDiferencia <= 7 && user.estado_suscripcion !== 'En gracia') {
            // Período de gracia
            nuevoEstado = 'En gracia'
            diasGraciaRestantes = 7 - diasDiferencia
          } else if (diasDiferencia > 7 && user.estado_suscripcion !== 'Bloqueado Parcial') {
            // Bloqueo parcial
            nuevoEstado = 'Bloqueado Parcial'
            diasGraciaRestantes = 0
          } else if (user.estado_suscripcion === 'En gracia' && diasDiferencia <= 7) {
            // Actualizar días restantes en período de gracia
            diasGraciaRestantes = Math.max(0, 7 - diasDiferencia)
          }
        }

        // Contar estadísticas
        switch (nuevoEstado) {
          case 'Activo':
            stats.activos++
            break
          case 'En deuda':
            stats.enDeuda++
            break
          case 'En gracia':
            stats.enGracia++
            break
          case 'Bloqueado Parcial':
            stats.bloqueados++
            break
        }

        // Actualizar si hay cambios
        if (nuevoEstado !== user.estado_suscripcion || diasGraciaRestantes !== user.dias_gracia_restantes) {
          await this.connection.execute(
            `UPDATE users SET 
             estado_suscripcion = ?, 
             dias_gracia_restantes = ? 
             WHERE id = ?`,
            [nuevoEstado, diasGraciaRestantes, user.id]
          )
          
          console.log(`📝 Usuario ${user.email} (ID: ${user.id}) actualizado: ${user.estado_suscripcion} → ${nuevoEstado}`)
          
          // Si cambió a un estado crítico, crear notificación
          if (nuevoEstado === 'En deuda' || nuevoEstado === 'En gracia' || nuevoEstado === 'Bloqueado Parcial') {
            await this.createNotification(user.id, nuevoEstado, diasGraciaRestantes)
          }
          
          updatedCount++
        }
      }
      
      console.log(`\n📊 Resumen de actualización:`)
      console.log(`   • Total procesados: ${users.length}`)
      console.log(`   • Estados actualizados: ${updatedCount}`)
      console.log(`   • Activos: ${stats.activos}`)
      console.log(`   • En deuda: ${stats.enDeuda}`)
      console.log(`   • En gracia: ${stats.enGracia}`)
      console.log(`   • Bloqueados: ${stats.bloqueados}`)
      
      return { processed: users.length, updated: updatedCount, stats }
      
    } catch (error) {
      console.error("❌ Error actualizando estados de suscripción:", error)
      throw error
    }
  }

  async createNotification(userId, estado, diasRestantes) {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      let tipo, mensaje

      switch (estado) {
        case 'En deuda':
          tipo = 'vencimiento'
          mensaje = 'Tu suscripción ha vencido. Tienes 7 días de gracia para regularizar el pago.'
          break
        case 'En gracia':
          tipo = 'gracia'
          mensaje = `Te quedan ${diasRestantes} días para regularizar tu pago antes del bloqueo.`
          break
        case 'Bloqueado Parcial':
          tipo = 'suspension'
          mensaje = 'Tus clientes ya no pueden acceder a tus tiendas. Regulariza tu pago para reactivar el servicio.'
          break
        default:
          return
      }

      // Verificar si ya existe una notificación para hoy
      const [existing] = await this.connection.execute(
        `SELECT id FROM subscription_notifications 
         WHERE user_id = ? AND tipo_notificacion = ? AND fecha_notificacion = ?`,
        [userId, tipo, hoy]
      )

      if (existing.length === 0) {
        await this.connection.execute(
          `INSERT INTO subscription_notifications 
           (user_id, tipo_notificacion, fecha_notificacion, dias_restantes, mensaje) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, tipo, hoy, diasRestantes, mensaje]
        )
        
        console.log(`🔔 Notificación creada para usuario ${userId}: ${tipo}`)
      }
    } catch (error) {
      console.error(`❌ Error creando notificación para usuario ${userId}:`, error)
    }
  }

  async generatePreventiveNotifications() {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const fechaAlerta = new Date()
      fechaAlerta.setDate(fechaAlerta.getDate() + 5) // 5 días en el futuro
      const fechaAlertaStr = fechaAlerta.toISOString().split('T')[0]
      
      console.log(`🔔 Generando notificaciones preventivas para vencimientos del ${fechaAlertaStr}`)
      
      // Usuarios que vencen en 5 días
      const [usuariosPrevención] = await this.connection.execute(
        `SELECT id, email FROM users 
         WHERE estado_suscripcion = 'Activo' 
         AND DATE(fecha_proximo_vencimiento) = ?
         AND role = 'user'
         AND id NOT IN (
           SELECT user_id FROM subscription_notifications 
           WHERE tipo_notificacion = 'preventivo' 
           AND fecha_notificacion = ?
         )`,
        [fechaAlertaStr, hoy]
      )

      for (const user of usuariosPrevención) {
        await this.connection.execute(
          `INSERT INTO subscription_notifications 
           (user_id, tipo_notificacion, fecha_notificacion, dias_restantes, mensaje) 
           VALUES (?, ?, ?, ?, ?)`,
          [user.id, 'preventivo', hoy, 5, 'Tu suscripción vence en 5 días. ¡Prepara tu pago!']
        )
        
        console.log(`🔔 Notificación preventiva creada para ${user.email}`)
      }

      console.log(`✅ Notificaciones preventivas generadas: ${usuariosPrevención.length}`)
      
    } catch (error) {
      console.error("❌ Error generando notificaciones preventivas:", error)
      throw error
    }
  }

  async run() {
    try {
      console.log("🚀 Iniciando actualización de estados de suscripción...\n")
      
      await this.connect()
      
      // Actualizar estados
      const result = await this.updateSubscriptionStates()
      
      // Generar notificaciones preventivas
      await this.generatePreventiveNotifications()
      
      console.log("\n✅ Proceso completado exitosamente")
      
      return result
      
    } catch (error) {
      console.error("\n❌ Error en el proceso:", error)
      throw error
    } finally {
      await this.disconnect()
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const updater = new SubscriptionUpdater()
  
  updater.run()
    .then((result) => {
      console.log("\n🎉 Script ejecutado exitosamente")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n💥 Error ejecutando script:", error)
      process.exit(1)
    })
}

module.exports = SubscriptionUpdater
