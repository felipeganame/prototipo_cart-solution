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
  subscription_start: string
  subscription_end: string
  last_payment_date?: string
  payment_status: "paid" | "pending" | "overdue"
  created_at: string
  plan_name: string
  plan_price: number
  store_count: number
  days_until_expiry: number
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
  }, [currentPage, statusFilter, authChecked, user])

  useEffect(() => {
    if (authChecked && user) {
      const delayedSearch = setTimeout(() => {
        if (currentPage === 1) {
          fetchUsers()
        } else {
          setCurrentPage(1)
        }
      }, 500)

      return () => clearTimeout(delayedSearch)
    }
  }, [searchTerm, authChecked, user])

  const checkAuth = async () => {
    try {
      console.log("Checking admin authentication...")
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        console.log("User data:", data.user)
        if (data.user.role !== "admin") {
          console.log("User is not admin, redirecting to login")
          router.push("/login")
          return
        }
        setUser(data.user)
        console.log("Admin authentication successful")
      } else {
        console.log("Authentication failed, redirecting to login")
        router.push("/login")
        return
      }
    } catch (error) {
      console.error("Error checking authentication:", error)
      router.push("/login")
      return
    } finally {
      setAuthChecked(true)
    }
  }

  const fetchUsers = async () => {
    if (!user) return
    
    try {
      console.log("Fetching users...")
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        search: searchTerm,
        status: statusFilter,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      console.log("Users API response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("Users data received:", data)
        setUsers(data.users || [])
        setTotalPages(data.pagination?.totalPages || 1)
      } else if (response.status === 403) {
        console.log("Access denied, redirecting to login")
        router.push("/login")
      } else {
        const errorData = await response.text()
        console.error("Users API error:", response.status, errorData)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
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

  const updatePaymentStatus = async (userId: number, status: "paid" | "pending" | "overdue") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status: status,
        }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
    }
  }

  const getStatusBadge = (user: UserData) => {
    if (!user.is_active) {
      return <Badge variant="secondary">Inactivo</Badge>
    }

    if (user.payment_status === "overdue") {
      return <Badge variant="destructive">En Deuda</Badge>
    }

    if (user.days_until_expiry <= 7 && user.days_until_expiry > 0) {
      return <Badge variant="secondary">Por Vencer</Badge>
    }

    if (user.days_until_expiry <= 0) {
      return <Badge variant="destructive">Vencido</Badge>
    }

    return <Badge variant="default">Activo</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>{!authChecked ? "Verificando autenticación..." : "Cargando usuarios..."}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin-dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Link>

          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra todos los usuarios de la plataforma</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar por email, empresa o nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="overdue">En Deuda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de usuarios */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios ({users.length})</CardTitle>
            <CardDescription>Lista completa de usuarios registrados en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Registro</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Tiendas</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{user.company_name}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.plan_name}</div>
                          <div className="text-sm text-muted-foreground">{formatCurrency(user.plan_price)}/mes</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(user.created_at)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(user.subscription_end)}
                          {user.days_until_expiry <= 7 && user.days_until_expiry > 0 && (
                            <div className="text-xs text-orange-600">{user.days_until_expiry} días restantes</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.store_count}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus(user.id, user.is_active)}
                              className={user.is_active ? "text-destructive" : "text-green-600"}
                            >
                              {user.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updatePaymentStatus(user.id, "paid")}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Marcar como Pagado
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updatePaymentStatus(user.id, "overdue")}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Marcar en Deuda
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
