"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

interface MetricsFormProps {
  processId: string
  onMetricCreated: (metric: any) => void
}

export function MetricsForm({ processId, onMetricCreated }: MetricsFormProps) {
  const [metricName, setMetricName] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [unit, setUnit] = useState("")
  const [measurementDate, setMeasurementDate] = useState(new Date().toISOString().split("T")[0])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { data, error: insertError } = await supabase
        .from("performance_metrics")
        .insert({
          process_id: processId,
          metric_name: metricName.trim(),
          target_value: Number.parseFloat(targetValue),
          current_value: Number.parseFloat(currentValue),
          unit: unit.trim(),
          measurement_date: measurementDate,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onMetricCreated(data)
      setMetricName("")
      setTargetValue("")
      setCurrentValue("")
      setUnit("")
      setMeasurementDate(new Date().toISOString().split("T")[0])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record metric")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Performance Metric</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="metric-name">Metric Name *</Label>
              <Input
                id="metric-name"
                placeholder="e.g., License Applications Processed"
                value={metricName}
                onChange={(e) => setMetricName(e.target.value)}
                required
              />
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
                placeholder="e.g., applications, hours, %"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="date">Measurement Date *</Label>
              <Input
                id="date"
                type="date"
                value={measurementDate}
                onChange={(e) => setMeasurementDate(e.target.value)}
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
              {isLoading ? "Recording..." : "Record Metric"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
