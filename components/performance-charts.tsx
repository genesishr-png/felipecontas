"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Metric {
  id: string
  metric_name: string
  target_value: number
  current_value: number
  unit: string
  measurement_date: string
}

interface KPI {
  id: string
  kpi_name: string
  metric_type: string
  target_value: number
  current_value: number
  unit: string
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]

export function PerformanceCharts({
  metrics,
  kpis,
}: {
  metrics: Metric[]
  kpis: KPI[]
}) {
  // Prepare data for line chart
  const metricsChartData = useMemo(() => {
    const sortedMetrics = [...(metrics || [])]
      .sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime())
      .slice(-30) // Last 30 measurements

    return sortedMetrics.map((metric) => ({
      date: new Date(metric.measurement_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      actual: metric.current_value,
      target: metric.target_value,
      metricName: metric.metric_name,
    }))
  }, [metrics])

  // Prepare data for KPI performance chart
  const kpiChartData = useMemo(() => {
    return (
      kpis?.map((kpi) => ({
        name: kpi.kpi_name,
        actual: kpi.current_value,
        target: kpi.target_value,
        variance: ((kpi.current_value - kpi.target_value) / kpi.target_value) * 100,
      })) || []
    )
  }, [kpis])

  // Prepare data for KPI status pie chart
  const statusData = useMemo(() => {
    const onTarget =
      kpis?.filter((kpi) => ((kpi.current_value - kpi.target_value) / kpi.target_value) * 100 <= 0).length || 0
    const slightlyOff =
      kpis?.filter((kpi) => {
        const variance = ((kpi.current_value - kpi.target_value) / kpi.target_value) * 100
        return variance > 0 && variance <= 10
      }).length || 0
    const significantlyOff = (kpis?.length || 0) - onTarget - slightlyOff

    return [
      { name: "On Target", value: onTarget },
      { name: "Slightly Off", value: slightlyOff },
      { name: "Significantly Off", value: significantlyOff },
    ]
  }, [kpis])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Performance Trend Chart */}
      {metricsChartData && metricsChartData.length > 0 && (
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metricsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Actual" />
                <Line type="monotone" dataKey="target" stroke="#10b981" strokeDasharray="5 5" name="Target" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* KPI Status Pie Chart */}
      {statusData.some((s) => s.value > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>KPI Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* KPI Performance Comparison */}
      {kpiChartData && kpiChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>KPI Performance vs Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kpiChartData} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={190} />
                <Tooltip />
                <Legend />
                <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                <Bar dataKey="target" fill="#10b981" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Variance Analysis */}
      {kpiChartData && kpiChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Variance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={kpiChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                <Bar dataKey="variance" fill="#f59e0b" name="Variance (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
