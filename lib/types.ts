export interface UserPlan {
  id: number
  name: string
  price: number
  max_stores: number
  max_products_per_store: number
  max_categories_per_store: number
  features: {
    analytics: boolean
    custom_branding: boolean
    priority_support: boolean
  }
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  password_hash: string
  role: "admin" | "user"
  plan_id: number
  company_name: string
  first_name: string
  last_name: string
  phone?: string
  country_code?: string
  is_active: boolean
  subscription_start: string
  subscription_end: string
  fecha_inicio_suscripcion?: string
  dia_vencimiento?: number
  ultimo_pago?: string
  estado_suscripcion: "Activo" | "En deuda" | "En gracia" | "Bloqueado Parcial"
  fecha_proximo_vencimiento?: string
  dias_gracia_restantes: number
  last_payment_date?: string
  payment_status: "paid" | "pending" | "overdue"
  created_at: string
  updated_at: string
  plan?: UserPlan
}

export interface Store {
  id: number
  user_id: number
  name: string
  description?: string
  address?: string
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
