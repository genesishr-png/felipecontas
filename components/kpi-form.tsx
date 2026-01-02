"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface KPIFormProps {
  processId: string
  onKPICreated: (kpi: any) => void
}

export function KPIForm({ processId, onKPICreated }: KPIFormProps) {
  const [kpiName, setKpiName] = useState("")
  const [metricType, setMetricType] = useState("average_time")
  const [targetValue, setTargetValue] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [unit, setUnit] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: insertError } = await supabase
        .from("kpis")
        .insert({
          process_id: processId,
          kpi_name: kpiName.trim(),
          metric_type: metricType,
          target_value: Number.parseFloat(targetValue),
          current_value: Number.parseFloat(currentValue),
          unit: unit.trim(),
        })
        .select()
        .single()

      if (insertError) throw insertError

      onKPICreated(data)
      setKpiName("")
      setMetricType("average_time")
      setTargetValue("")
      setCurrentValue("")
      setUnit("")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create KPI")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New KPI</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="kpi-name">KPI Name *</Label>
              <Input
                id="kpi-name"
                placeholder="e.g., Average Processing Time"
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="metric-type">Metric Type *</Label>
              <select
                id="metric-type"
                value={metricType}
                onChange={(e) => setMetricType(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
              >
                <option value="average_time">Average Time</option>
                <option value="success_rate">Success Rate</option>
                <option value="volume">Volume</option>
                <option value="cost">Cost</option>
                <option value="satisfaction">Satisfaction Score</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target">Target Value *</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="current">Current Value *</Label>
                <Input
                  id="current"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                placeholder="e.g., days, %, count"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex gap-2 bg-destructive/10 text-destructive px-3 py-2 rounded-md text-sm items-start">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating..." : "Create KPI"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
