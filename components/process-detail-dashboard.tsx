"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, TrendingUp } from "lucide-react"
import { KPIForm } from "./kpi-form"
import { MetricsForm } from "./metrics-form"
import { KPICard } from "./kpi-card"
import { PerformanceCharts } from "./performance-charts"

interface Process {
  id: string
  name: string
  description: string
  sector_id: string
  owner_id: string
}

interface Sector {
  id: string
  name: string
}

interface KPI {
  id: string
  kpi_name: string
  metric_type: string
  target_value: number
  current_value: number
  unit: string
  last_updated: string
}

interface Metric {
  id: string
  metric_name: string
  target_value: number
  current_value: number
  unit: string
  measurement_date: string
}

export function ProcessDetailDashboard({
  process,
  sector,
  kpis: initialKpis,
  metrics: initialMetrics,
  user,
}: {
  process: Process
  sector: Sector
  kpis: KPI[]
  metrics: Metric[]
  user: any
}) {
  const [kpis, setKpis] = useState<KPI[]>(initialKpis || [])
  const [metrics, setMetrics] = useState<Metric[]>(initialMetrics || [])
  const [showKPIForm, setShowKPIForm] = useState(false)
  const [showMetricsForm, setShowMetricsForm] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const isOwner = user.id === process.owner_id

  const handleKPICreated = (newKPI: KPI) => {
    setKpis([...kpis, newKPI])
    setShowKPIForm(false)
  }

  const handleMetricCreated = (newMetric: Metric) => {
    setMetrics([newMetric, ...metrics])
    setShowMetricsForm(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/${process.sector_id}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-primary">{process.name}</h1>
                <p className="text-sm text-muted-foreground">{sector?.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          {/* Process Description */}
          <Card>
            <CardHeader>
              <CardTitle>Process Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{process.description}</p>
            </CardContent>
          </Card>

          {/* KPIs Section */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                Key Performance Indicators
              </h2>
              {isOwner && (
                <Button onClick={() => setShowKPIForm(!showKPIForm)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {showKPIForm ? "Cancel" : "Add KPI"}
                </Button>
              )}
            </div>

            {showKPIForm && isOwner && <KPIForm processId={process.id} onKPICreated={handleKPICreated} />}

            {kpis && kpis.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi) => (
                  <KPICard key={kpi.id} kpi={kpi} isOwner={isOwner} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    {isOwner ? "No KPIs yet. Add one to track performance." : "No KPIs tracked for this process."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Charts Section */}
          {kpis && kpis.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-bold">Analytics & Visualization</h2>
              <PerformanceCharts metrics={metrics} kpis={kpis} />
            </div>
          )}

          {/* Metrics Section */}
          {isOwner && (
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Performance Metrics</h2>
                <Button onClick={() => setShowMetricsForm(!showMetricsForm)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {showMetricsForm ? "Cancel" : "Record Metric"}
                </Button>
              </div>

              {showMetricsForm && <MetricsForm processId={process.id} onMetricCreated={handleMetricCreated} />}

              {metrics && metrics.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Measurements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b">
                          <tr className="text-muted-foreground">
                            <th className="text-left py-2 px-2">Metric</th>
                            <th className="text-left py-2 px-2">Target</th>
                            <th className="text-left py-2 px-2">Current</th>
                            <th className="text-left py-2 px-2">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {metrics.map((metric) => (
                            <tr key={metric.id} className="border-b hover:bg-muted/50">
                              <td className="py-2 px-2">{metric.metric_name}</td>
                              <td className="py-2 px-2">
                                {metric.target_value} {metric.unit}
                              </td>
                              <td className="py-2 px-2">
                                {metric.current_value} {metric.unit}
                              </td>
                              <td className="py-2 px-2 text-muted-foreground">
                                {new Date(metric.measurement_date).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">No metrics recorded yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
