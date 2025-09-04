export interface PaymentRecord {
  id: number
  user_id: number
  amount: number
  payment_date: string
  payment_method: "admin" | "credit_card" | "paypal" | "bank_transfer"
  payment_details?: {
    card_last_digits?: string
    transaction_id?: string
    reference?: string
  }
  created_by_admin: boolean
  admin_id?: number
  notes?: string
  created_at: string
}

export interface User {
  id: number
  email: string
  password_hash: string
  role: "admin" | "user"
  company_name: string
  first_name: string
  last_name: string
  phone?: string
  country_code?: string
  is_active: boolean
  account_status: "activo" | "inactivo"
  monthly_payment: number
  max_stores: number
  next_payment_due: string
  days_overdue: number
  last_payment_date?: string
  payment_status: "al_dia" | "en_deuda"
  created_at: string
  updated_at: string
}

export interface Store {
  id: number
  user_id: number
  name: string
  description?: string
  address?: string // Mantener para compatibilidad
  country?: string
  state_province?: string
  city?: string
  postal_code?: string
  street_address?: string // Mantener para compatibilidad
  street_name?: string
  street_number?: string
  phone?: string
  whatsapp_number?: string
  logo_url?: string
  is_active: boolean
  qr_code: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  store_id: number
  name: string
  description?: string
  icon?: string
  background_image_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  category_id: number
  name: string
  description?: string
  price: number
  image_url?: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Order {
  id: number
  store_id: number
  customer_name?: string
  customer_phone?: string
  total_amount: number
  payment_method: "efectivo" | "otro"
  cash_amount?: number
  change_amount?: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  whatsapp_sent: boolean
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
  product?: Product
}

export interface PaymentHistory {
  id: number
  user_id: number
  fecha_pago: string
  monto: number
  metodo_pago: "manual" | "automatico"
  periodo_pagado: string
  estado_anterior?: "Activo" | "En deuda" | "En gracia" | "Bloqueado Parcial"
  estado_nuevo: "Activo" | "En deuda" | "En gracia" | "Bloqueado Parcial"
  notas?: string
  created_at: string
}

export interface SubscriptionNotification {
  id: number
  user_id: number
  tipo_notificacion: "preventivo" | "vencimiento" | "gracia" | "suspension"
  fecha_notificacion: string
  dias_restantes?: number
  mensaje: string
  enviada: boolean
  fecha_envio?: string
  created_at: string
}

export interface SubscriptionStatus {
  estado: "Activo" | "En deuda" | "En gracia" | "Bloqueado Parcial"
  dias_restantes?: number
  fecha_proximo_vencimiento?: string
  mensaje?: string
  puede_acceder_qr: boolean
}
