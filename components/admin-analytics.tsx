"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, LogOut } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useMemo } from "react"

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]

export function AdminAnalytics({
  allKpis,
  allMetrics,
  processes,
  user,
}: {
  allKpis: any[]
  allMetrics: any[]
  processes: any[]
  user: any
}) {
  const router = useRouter()
  const supabase = createClient()

  // Prepare sector-wise KPI data
  const sectorKpiData = useMemo(() => {
    const sectorMap = new Map()
    allKpis?.forEach((kpi) => {
      const sectorName = kpi.processes?.sectors?.name || "Unknown"
      if (!sectorMap.has(sectorName)) {
        sectorMap.set(sectorName, { name: sectorName, count: 0, onTarget: 0 })
      }
      const sector = sectorMap.get(sectorName)
      sector.count++
      const variance = ((kpi.current_value - kpi.target_value) / kpi.target_value) * 100
      if (variance <= 0) {
        sector.onTarget++
      }
    })
    return Array.from(sectorMap.values())
  }, [allKpis])

  // Prepare metric trend data
  const metricTrendData = useMemo(() => {
    const dateMap = new Map()
    allMetrics?.forEach((metric) => {
      const date = new Date(metric.measurement_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      if (!dateMap.has(date)) {
        dateMap.set(date, { date, metrics: 0, avgVariance: 0 })
      }
      const entry = dateMap.get(date)
      entry.metrics++
    })
    return Array.from(dateMap.values()).slice(-30)
  }, [allMetrics])

  // Prepare process type distribution
  const processDistribution = useMemo(() => {
    const processMap = new Map()
    processes?.forEach((process) => {
      const sectorName = process.sectors?.name || "Unknown"
      const current = processMap.get(sectorName) || 0
      processMap.set(sectorName, current + 1)
    })
    return Array.from(processMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))
  }, [processes])

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
              <Link href="/admin">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-primary">Analytics</h1>
                <p className="text-sm text-muted-foreground">System-wide performance analytics</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Performance Chart */}
          {sectorKpiData && sectorKpiData.length > 0 && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>KPI Performance by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sectorKpiData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTarget" fill="#10b981" name="On Target" />
                    <Bar dataKey="count" fill="#e5e7eb" name="Total KPIs" opacity={0.5} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Process Distribution */}
          {processDistribution && processDistribution.length > 0 && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Processes by Sector</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {processDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Metric Recording Trend */}
          {metricTrendData && metricTrendData.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Metric Recording Activity (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metricTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="metrics" stroke="#3b82f6" name="Metrics Recorded" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
