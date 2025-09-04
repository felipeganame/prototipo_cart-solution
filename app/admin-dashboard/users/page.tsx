"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ArrowLeft, Search, MoreHorizontal, UserCheck, UserX, Eye, Calendar, DollarSign } from "lucide-react"

interface UserData {
  id: number
  email: string
  company_name: string
  first_name: string
  last_name: string
  is_active: boolean
  account_status: "activo" | "inactivo"
  monthly_payment: number
  max_stores: number
  next_payment_due: string
  days_overdue: number
  last_payment_date?: string
  payment_status: "al_dia" | "en_deuda"
  created_at: string
  store_count: number
  days_until_due: number
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authChecked && user) {
      fetchUsers()
    }
  }, [authChecked, user, currentPage, searchTerm, statusFilter])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const userData = await response.json()
        if (userData.user && userData.user.role === "admin") {
          setUser(userData.user)
        } else {
          console.log("User is not admin, redirecting to home")
          router.push("/")
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      router.push("/login")
    } finally {
      setAuthChecked(true)
    }
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setTotalPages(data.totalPages || 1)
      } else {
        console.error("Failed to fetch users")
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const markAsPaid = async (userId: number, currentPayment: number) => {
    const newPayment = prompt(`Ingrese el monto del pago (actual: $${currentPayment})`, currentPayment.toString())
    if (!newPayment || isNaN(parseFloat(newPayment))) return

    try {
      console.log('Marking as paid:', { userId, newPayment: parseFloat(newPayment) })
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mark_as_paid: true,
          monthly_payment: parseFloat(newPayment),
        }),
      })

      console.log('Mark as paid response status:', response.status)
      const responseData = await response.json()
      console.log('Mark as paid response data:', responseData)

      if (response.ok) {
        alert(`Pago registrado exitosamente: $${responseData.payment_amount}`)
        fetchUsers()
      } else {
        console.error("Failed to mark as paid:", responseData)
        alert(`Error: ${responseData.error || "No se pudo registrar el pago"}`)
      }
    } catch (error) {
      console.error("Error marking as paid:", error)
      alert("Error de red. Intenta de nuevo.")
    }
  }

  const toggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !currentStatus,
        }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error updating user status:", error)
    }
  }

  const updatePaymentStatus = async (userId: number, status: "al_dia" | "en_deuda") => {
    try {
      console.log('Updating payment status:', { userId, status })
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status: status,
        }),
      })

      console.log('Update payment status response:', response.status)
      const responseData = await response.json()
      console.log('Update payment status data:', responseData)

      if (response.ok) {
        alert(`Estado de pago actualizado a: ${status === 'al_dia' ? 'Al día' : 'En deuda'}`)
        fetchUsers()
      } else {
        console.error("Failed to update payment status:", responseData)
        alert(`Error: ${responseData.error || "No se pudo actualizar el estado de pago"}`)
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      alert("Error de red. Intenta de nuevo.")
    }
  }

  const getStatusBadge = (user: UserData) => {
    const statusMap = {
      al_dia: { variant: "success" as const, text: "Al día", color: "bg-green-100 text-green-800" },
      en_deuda: { variant: "warning" as const, text: "En deuda", color: "bg-yellow-100 text-yellow-800" },
      paid: { variant: "success" as const, text: "Al día", color: "bg-green-100 text-green-800" },
      pending: { variant: "warning" as const, text: "En deuda", color: "bg-yellow-100 text-yellow-800" },
      overdue: { variant: "warning" as const, text: "En deuda", color: "bg-yellow-100 text-yellow-800" }
    }
    
    const status = statusMap[user.payment_status as keyof typeof statusMap] || statusMap.pending
    return (
      <Badge className={status.color}>
        {status.text}
      </Badge>
    )
  }

  const getAccountStatusBadge = (user: UserData) => {
    const isActive = user.account_status === 'activo' || user.is_active
    return (
      <Badge className={isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
        {isActive ? "Activo" : "Inactivo"}
      </Badge>
    )
  }

  const updateAccountStatus = async (userId: number, isActive: boolean) => {
    try {
      console.log('Updating account status:', { userId, isActive })
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      })

      console.log('Update account status response:', response.status)
      const responseData = await response.json()
      console.log('Update account status data:', responseData)

      if (response.ok) {
        alert(`Cuenta ${isActive ? 'activada' : 'desactivada'} exitosamente`)
        fetchUsers() // Recargar la lista
      } else {
        console.error("Failed to update account status:", responseData)
        alert(`Error: ${responseData.error || "No se pudo actualizar el estado de la cuenta"}`)
      }
    } catch (error) {
      console.error("Error updating account status:", error)
      alert("Error de red. Intenta de nuevo.")
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') return "N/A"
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "N/A"
      return date.toLocaleDateString("es-ES")
    } catch (error) {
      return "N/A"
    }
  }

  const formatCurrency = (amount: number | null | undefined | string) => {
    if (amount === null || amount === undefined) {
      return "$0.00"
    }
    
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (isNaN(numAmount)) {
      return "$0.00"
    }
    
    return `$${numAmount.toFixed(2)}`
  }

  const getDaysDisplay = (user: UserData) => {
    if (user.days_until_due > 0) {
      return (
        <div className="text-sm">
          <div className="text-green-600">Vence en {user.days_until_due} días</div>
          <div className="text-xs text-muted-foreground">{formatDate(user.next_payment_due)}</div>
        </div>
      )
    } else if (user.days_until_due === 0) {
      return (
        <div className="text-sm">
          <div className="text-yellow-600">Vence hoy</div>
          <div className="text-xs text-muted-foreground">{formatDate(user.next_payment_due)}</div>
        </div>
      )
    } else {
      const overdueDays = Math.abs(user.days_until_due)
      return (
        <div className="text-sm">
          <div className="text-red-600">Vencido hace {overdueDays} días</div>
          <div className="text-xs text-muted-foreground">{formatDate(user.next_payment_due)}</div>
        </div>
      )
    }
  }

  if (!authChecked) {
    return <div className="flex justify-center items-center min-h-screen">Verificando autorización...</div>
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
            <p className="text-muted-foreground">Administra usuarios y sus suscripciones</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Registrados</CardTitle>
          <CardDescription>Lista completa de usuarios con toda su información</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="al_dia">Al día</SelectItem>
                <SelectItem value="en_deuda">En deuda</SelectItem>
                <SelectItem value="activo">Cuentas Activas</SelectItem>
                <SelectItem value="inactivo">Cuentas Inactivas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Cargando usuarios...</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Pago Mensual</TableHead>
                    <TableHead>Tiendas</TableHead>
                    <TableHead>Estado Cuenta</TableHead>
                    <TableHead>Estado Pago</TableHead>
                    <TableHead>Próximo Vencimiento</TableHead>
                    <TableHead>Último Pago</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {userData.first_name} {userData.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{userData.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{userData.company_name || "Sin especificar"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(userData.monthly_payment)}</div>
                        <div className="text-xs text-muted-foreground">
                          Máx. {userData.max_stores} {userData.max_stores === 1 ? 'tienda' : 'tiendas'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{userData.store_count}</span>
                          <span className="text-xs text-muted-foreground">
                            / {userData.max_stores}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getAccountStatusBadge(userData)}</TableCell>
                      <TableCell>{getStatusBadge(userData)}</TableCell>
                      <TableCell>
                        {getDaysDisplay(userData)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {userData.last_payment_date ? formatDate(userData.last_payment_date) : "Nunca"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(userData.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(userData.id, userData.is_active)}
                              className="flex items-center"
                            >
                              {userData.is_active ? (
                                <>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => markAsPaid(userData.id, userData.monthly_payment)}
                              className="flex items-center"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Marcar como Pagado
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updatePaymentStatus(userData.id, "en_deuda")}
                              className="flex items-center"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Marcar en Deuda
                            </DropdownMenuItem>
                            {userData.account_status === 'inactivo' || !userData.is_active ? (
                              <DropdownMenuItem
                                onClick={() => updateAccountStatus(userData.id, true)}
                                className="flex items-center"
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                Reactivar Cuenta
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => updateAccountStatus(userData.id, false)}
                                className="flex items-center"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                Desactivar Cuenta
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
