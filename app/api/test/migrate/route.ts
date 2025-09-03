import { NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "pedi_solutions",
  port: parseInt(process.env.DB_PORT || "3306"),
}

export async function GET() {
  try {
    console.log("Testing database connection and schema...")
    
    const connection = await mysql.createConnection(dbConfig)
    
    try {
      // Verificar si las nuevas columnas existen
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM users LIKE 'estado_suscripcion'`
      )
      
      if ((columns as any[]).length === 0) {
        // Crear las nuevas columnas si no existen
        console.log("Creating new subscription columns...")
        
        await connection.execute(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS fecha_inicio_suscripcion DATE AFTER subscription_end,
          ADD COLUMN IF NOT EXISTS dia_vencimiento INT AFTER fecha_inicio_suscripcion,
          ADD COLUMN IF NOT EXISTS ultimo_pago DATE AFTER dia_vencimiento,
          ADD COLUMN IF NOT EXISTS estado_suscripcion ENUM('Activo', 'En deuda', 'En gracia', 'Bloqueado Parcial') DEFAULT 'Activo' AFTER ultimo_pago,
          ADD COLUMN IF NOT EXISTS fecha_proximo_vencimiento DATE AFTER estado_suscripcion,
          ADD COLUMN IF NOT EXISTS dias_gracia_restantes INT DEFAULT 0 AFTER fecha_proximo_vencimiento
        `)
        
        console.log("✅ Columns created successfully")
      } else {
        console.log("✅ Columns already exist")
      }
      
      // Crear tabla de historial de pagos si no existe
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS payment_history (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          fecha_pago DATE NOT NULL,
          monto DECIMAL(10,2) NOT NULL,
          metodo_pago ENUM('manual', 'automatico') DEFAULT 'manual',
          periodo_pagado VARCHAR(20),
          estado_anterior ENUM('Activo', 'En deuda', 'En gracia', 'Bloqueado Parcial'),
          estado_nuevo ENUM('Activo', 'En deuda', 'En gracia', 'Bloqueado Parcial'),
          notas TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)
      
      // Crear tabla de notificaciones si no existe
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS subscription_notifications (
          id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          tipo_notificacion ENUM('preventivo', 'vencimiento', 'gracia', 'suspension') NOT NULL,
          fecha_notificacion DATE NOT NULL,
          dias_restantes INT,
          mensaje TEXT,
          enviada BOOLEAN DEFAULT FALSE,
          fecha_envio TIMESTAMP NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)
      
      console.log("✅ Tables created successfully")
      
      // Verificar un usuario de prueba
      const [testUser] = await connection.execute(
        `SELECT id, email, estado_suscripcion FROM users WHERE role = 'user' LIMIT 1`
      )
      
      return NextResponse.json({
        success: true,
        message: "Database migration completed successfully",
        columnsExisted: (columns as any[]).length > 0,
        testUser: testUser
      })
      
    } finally {
      await connection.end()
    }
    
  } catch (error) {
    console.error("Database migration error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
