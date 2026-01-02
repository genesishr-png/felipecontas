"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KPI {
  id: string
  kpi_name: string
  metric_type: string
  target_value: number
  current_value: number
  unit: string
  last_updated: string
}

export function KPICard({ kpi, isOwner }: { kpi: KPI; isOwner: boolean }) {
  const variance = ((kpi.current_value - kpi.target_value) / kpi.target_value) * 100
  const isPositive = variance <= 0 // For most metrics, lower variance is better
  const performanceColor = isPositive ? "text-green-600" : "text-red-600"

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{kpi.kpi_name}</CardTitle>
          <div className={performanceColor}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target</span>
            <span className="font-semibold">
              {kpi.target_value} {kpi.unit}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Current</span>
            <span className="font-semibold">
              {kpi.current_value} {kpi.unit}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${isPositive ? "bg-green-500" : "bg-orange-500"}`}
              style={{
                width: `${Math.min((kpi.current_value / kpi.target_value) * 100, 100)}%`,
              }}
            />
          </div>
          <p className={`text-xs font-semibold ${performanceColor}`}>
            {Math.abs(variance).toFixed(1)}% {isPositive ? "under" : "over"} target
          </p>
        </div>

        <p className="text-xs text-muted-foreground">Updated: {new Date(kpi.last_updated).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  )
}
