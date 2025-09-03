"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Crown } from "lucide-react"

interface UserPlan {
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
}

interface PlanRestrictionsProps {
  currentCount: number
  maxAllowed: number
  itemType: "tiendas" | "productos" | "categorías"
  planName: string
  showUpgrade?: boolean
}

export function PlanRestrictions({
  currentCount,
  maxAllowed,
  itemType,
  planName,
  showUpgrade = true,
}: PlanRestrictionsProps) {
  const isAtLimit = currentCount >= maxAllowed
  const isNearLimit = currentCount >= maxAllowed * 0.8

  if (maxAllowed === 999) return null // Plan Premium sin límites

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {itemType}: {currentCount} / {maxAllowed}
        </span>
        <Badge variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}>Plan {planName}</Badge>
      </div>

      {isAtLimit && (
        <Alert className="border-destructive/50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Has alcanzado el límite de {maxAllowed} {itemType} para tu plan {planName}.
            {showUpgrade && " Actualiza tu plan para agregar más."}
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isAtLimit && (
        <Alert>
          <Crown className="h-4 w-4" />
          <AlertDescription>
            Te estás acercando al límite de tu plan. Considera actualizar para obtener más {itemType}.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export function usePlanRestrictions() {
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.user.plan)
        }
      } catch (error) {
        console.error("Error fetching user plan:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPlan()
  }, [])

  const canAddItem = (currentCount: number, itemType: "stores" | "products" | "categories") => {
    if (!userPlan) return false

    switch (itemType) {
      case "stores":
        return currentCount < userPlan.max_stores
      case "products":
        return currentCount < userPlan.max_products_per_store
      case "categories":
        return currentCount < userPlan.max_categories_per_store
      default:
        return false
    }
  }

  return {
    userPlan,
    isLoading,
    canAddItem,
  }
}
