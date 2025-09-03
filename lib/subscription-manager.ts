import mysql from "mysql2/promise"
import { SubscriptionStatus, PaymentHistory, SubscriptionNotification } from "./types"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pedi_solutions",
  port: parseInt(process.env.DB_PORT || "3306"),
  connectionLimit: 10
}

const pool = mysql.createPool(dbConfig)

export class SubscriptionManager {
  
  /**
   * Registra un pago manual y actualiza el estado de la suscripción
   */
  static async registrarPago(userId: number, fechaPago: string, monto: number): Promise<void> {
    const connection = await pool.getConnection()
    
    try {
      await connection.beginTransaction()

      // Obtener información actual del usuario
      const [userResult] = await connection.execute(
        `SELECT id, estado_suscripcion, dia_vencimiento, fecha_inicio_suscripcion, 
         fecha_proximo_vencimiento FROM users WHERE id = ?`,
        [userId]
      )
      
      const user = (userResult as any[])[0]
      if (!user) throw new Error("Usuario no encontrado")

      const estadoAnterior = user.estado_suscripcion
      const fechaPagoDate = new Date(fechaPago)
      
      // Si es el primer pago, establecer día de vencimiento
      let diaVencimiento = user.dia_vencimiento
      if (!diaVencimiento) {
        diaVencimiento = fechaPagoDate.getDate()
        await connection.execute(
          `UPDATE users SET fecha_inicio_suscripcion = ?, dia_vencimiento = ? WHERE id = ?`,
          [fechaPago, diaVencimiento, userId]
        )
      }

      // Calcular próximo vencimiento basado en el día fijo
      const proximoVencimiento = this.calcularProximoVencimiento(diaVencimiento, fechaPagoDate)
      
      // Actualizar estado del usuario
      await connection.execute(
        `UPDATE users SET 
         ultimo_pago = ?, 
         estado_suscripcion = 'Activo',
         fecha_proximo_vencimiento = ?,
         dias_gracia_restantes = 0,
         payment_status = 'paid'
         WHERE id = ?`,
        [fechaPago, proximoVencimiento, userId]
      )

      // Registrar en el historial de pagos
      const periodo = `${fechaPagoDate.getFullYear()}-${String(fechaPagoDate.getMonth() + 1).padStart(2, '0')}`
      await connection.execute(
        `INSERT INTO payment_history 
         (user_id, fecha_pago, monto, metodo_pago, periodo_pagado, estado_anterior, estado_nuevo) 
         VALUES (?, ?, ?, 'manual', ?, ?, 'Activo')`,
        [userId, fechaPago, monto, periodo, estadoAnterior]
      )

      await connection.commit()
      console.log(`Pago registrado exitosamente para usuario ${userId}`)
      
    } catch (error) {
      await connection.rollback()
      console.error("Error registrando pago:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Actualiza los estados de suscripción de todos los usuarios según las fechas
   */
  static async actualizarEstadosSuscripcion(): Promise<void> {
    const connection = await pool.getConnection()
    
    try {
      const hoy = new Date().toISOString().split('T')[0]
      
      // Obtener usuarios que necesitan actualización de estado
      const [users] = await connection.execute(
        `SELECT id, estado_suscripcion, fecha_proximo_vencimiento, 
         dias_gracia_restantes FROM users 
         WHERE fecha_proximo_vencimiento IS NOT NULL 
         AND estado_suscripcion != 'Bloqueado Parcial'`
      ) as any[]

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
          } else if (diasDiferencia > 7) {
            // Bloqueo parcial
            nuevoEstado = 'Bloqueado Parcial'
            diasGraciaRestantes = 0
          }
        }

        // Actualizar si hay cambios
        if (nuevoEstado !== user.estado_suscripcion || diasGraciaRestantes !== user.dias_gracia_restantes) {
          await connection.execute(
            `UPDATE users SET 
             estado_suscripcion = ?, 
             dias_gracia_restantes = ? 
             WHERE id = ?`,
            [nuevoEstado, diasGraciaRestantes, user.id]
          )
          
          console.log(`Usuario ${user.id} actualizado a estado: ${nuevoEstado}`)
        }
      }
      
    } catch (error) {
      console.error("Error actualizando estados de suscripción:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Obtiene el estado de suscripción actual de un usuario
   */
  static async obtenerEstadoSuscripcion(userId: number): Promise<SubscriptionStatus> {
    const connection = await pool.getConnection()
    
    try {
      const [result] = await connection.execute(
        `SELECT estado_suscripcion, dias_gracia_restantes, fecha_proximo_vencimiento 
         FROM users WHERE id = ?`,
        [userId]
      )
      
      const user = (result as any[])[0]
      if (!user) throw new Error("Usuario no encontrado")

      const estado = user.estado_suscripcion
      const diasRestantes = user.dias_gracia_restantes
      const fechaVencimiento = user.fecha_proximo_vencimiento
      
      let mensaje = ""
      let puedeAccederQr = true

      switch (estado) {
        case 'Activo':
          if (fechaVencimiento) {
            const diasHastaVencimiento = Math.ceil(
              (new Date(fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            )
            if (diasHastaVencimiento <= 5 && diasHastaVencimiento > 0) {
              mensaje = `Tu suscripción vence en ${diasHastaVencimiento} días. ¡Regulariza tu pago para evitar interrupciones!`
            }
          }
          break
          
        case 'En deuda':
          mensaje = "Tu suscripción ha vencido. Tienes 7 días de gracia para regularizar el pago."
          break
          
        case 'En gracia':
          mensaje = `Te quedan ${diasRestantes} días para regularizar tu pago antes de que se deshabilite el acceso público a tus tiendas.`
          break
          
        case 'Bloqueado Parcial':
          mensaje = "Tus clientes ya no pueden ver tu tienda por QR hasta que regularices el pago. Tu panel sigue disponible."
          puedeAccederQr = false
          break
      }

      return {
        estado,
        dias_restantes: diasRestantes > 0 ? diasRestantes : undefined,
        fecha_proximo_vencimiento: fechaVencimiento,
        mensaje,
        puede_acceder_qr: puedeAccederQr
      }
      
    } catch (error) {
      console.error("Error obteniendo estado de suscripción:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Genera notificaciones pendientes para usuarios próximos a vencer
   */
  static async generarNotificaciones(): Promise<void> {
    const connection = await pool.getConnection()
    
    try {
      const hoy = new Date().toISOString().split('T')[0]
      
      // Usuarios que necesitan notificación preventiva (5 días antes)
      const [usuariosPrevención] = await connection.execute(
        `SELECT id, fecha_proximo_vencimiento FROM users 
         WHERE estado_suscripcion = 'Activo' 
         AND DATE(fecha_proximo_vencimiento) = DATE_ADD(?, INTERVAL 5 DAY)
         AND id NOT IN (
           SELECT user_id FROM subscription_notifications 
           WHERE tipo_notificacion = 'preventivo' 
           AND fecha_notificacion = ?
         )`,
        [hoy, hoy]
      ) as any[]

      // Crear notificaciones preventivas
      for (const user of usuariosPrevención) {
        await this.crearNotificacion(
          connection, 
          user.id, 
          'preventivo', 
          hoy, 
          5, 
          'Tu suscripción vence en 5 días. ¡Prepara tu pago!'
        )
      }

      // Usuarios en período de gracia
      const [usuariosGracia] = await connection.execute(
        `SELECT id, dias_gracia_restantes FROM users 
         WHERE estado_suscripcion = 'En gracia' 
         AND dias_gracia_restantes > 0`,
        []
      ) as any[]

      for (const user of usuariosGracia) {
        const existe = await connection.execute(
          `SELECT id FROM subscription_notifications 
           WHERE user_id = ? AND tipo_notificacion = 'gracia' 
           AND fecha_notificacion = ? AND dias_restantes = ?`,
          [user.id, hoy, user.dias_gracia_restantes]
        )
        
        if ((existe[0] as any[]).length === 0) {
          await this.crearNotificacion(
            connection,
            user.id,
            'gracia',
            hoy,
            user.dias_gracia_restantes,
            `¡Atención! Te quedan ${user.dias_gracia_restantes} días antes del bloqueo parcial.`
          )
        }
      }

      console.log('Notificaciones generadas exitosamente')
      
    } catch (error) {
      console.error("Error generando notificaciones:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  /**
   * Obtiene el historial de pagos de un usuario
   */
  static async obtenerHistorialPagos(userId: number): Promise<PaymentHistory[]> {
    const connection = await pool.getConnection()
    
    try {
      const [results] = await connection.execute(
        `SELECT * FROM payment_history WHERE user_id = ? ORDER BY fecha_pago DESC`,
        [userId]
      )
      
      return results as PaymentHistory[]
      
    } catch (error) {
      console.error("Error obteniendo historial de pagos:", error)
      throw error
    } finally {
      connection.release()
    }
  }

  // Métodos privados auxiliares

  private static calcularProximoVencimiento(diaVencimiento: number, fechaReferencia: Date): string {
    const proximoMes = new Date(fechaReferencia)
    proximoMes.setMonth(proximoMes.getMonth() + 1)
    
    // Ajustar si el día no existe en el próximo mes (ej: 31 en febrero)
    const ultimoDiaDelMes = new Date(proximoMes.getFullYear(), proximoMes.getMonth() + 1, 0).getDate()
    const diaFinal = Math.min(diaVencimiento, ultimoDiaDelMes)
    
    proximoMes.setDate(diaFinal)
    return proximoMes.toISOString().split('T')[0]
  }

  private static async crearNotificacion(
    connection: any, 
    userId: number, 
    tipo: string, 
    fecha: string, 
    diasRestantes?: number, 
    mensaje?: string
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO subscription_notifications 
       (user_id, tipo_notificacion, fecha_notificacion, dias_restantes, mensaje) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, tipo, fecha, diasRestantes, mensaje]
    )
  }
}

// Función helper para verificar si un usuario puede acceder al QR público
export async function puedeAccederQR(userId: number): Promise<boolean> {
  try {
    const estado = await SubscriptionManager.obtenerEstadoSuscripcion(userId)
    return estado.puede_acceder_qr
  } catch (error) {
    console.error("Error verificando acceso QR:", error)
    return false // Por seguridad, denegar acceso si hay error
  }
}
