"use client"

import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Users, FileText, TrendingUp, LogOut } from "lucide-react"

interface Sector {
  id: string
  name: string
  description: string
}

interface UserSector {
  user_id: string
  sector_id: string
  role: string
}

interface Process {
  id: string
  name: string
  sector_id: string
}

interface KPI {
  id: string
  kpi_name: string
  current_value: number
  target_value: number
}

export function AdminDashboard({
  sectors,
  userSectors,
  processes,
  allKpis,
  uniqueUsers,
  user,
}: {
  sectors: Sector[]
  userSectors: UserSector[]
  processes: Process[]
  allKpis: KPI[]
  uniqueUsers: number
  user: any
}) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const kpiPerformance = allKpis?.reduce(
    (acc, kpi) => {
      const variance = ((kpi.current_value - kpi.target_value) / kpi.target_value) * 100
      if (variance <= 0) {
        acc.onTarget++
      } else if (variance <= 10) {
        acc.slightly_off++
      } else {
        acc.significantly_off++
      }
      return acc
    },
    { onTarget: 0, slightly_off: 0, significantly_off: 0 },
  ) || {
    onTarget: 0,
    slightly_off: 0,
    significantly_off: 0,
  }

  return (
    <div className="min-h-svh bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">System-wide performance overview</p>
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
        <div className="flex flex-col gap-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Users */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{uniqueUsers}</div>
                <p className="text-xs text-muted-foreground">Active users in system</p>
              </CardContent>
            </Card>

            {/* Total Sectors */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sectors</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sectors?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Performance sectors tracked</p>
              </CardContent>
            </Card>

            {/* Total Processes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Processes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{processes?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Processes registered</p>
              </CardContent>
            </Card>

            {/* Total KPIs */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KPIs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allKpis?.length || 0}</div>
                <p className="text-xs text-muted-foreground">KPIs monitored</p>
              </CardContent>
            </Card>
          </div>

          {/* KPI Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>KPI Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{kpiPerformance.onTarget}</div>
                  <p className="text-sm text-muted-foreground mt-2">On Target</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{kpiPerformance.slightly_off}</div>
                  <p className="text-sm text-muted-foreground mt-2">Slightly Off (≤10%)</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{kpiPerformance.significantly_off}</div>
                  <p className="text-sm text-muted-foreground mt-2">Significantly Off ({">"}10%)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sector Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Sectors Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sectors && sectors.length > 0 ? (
                  sectors.map((sector) => {
                    const sectorProcesses = processes?.filter((p) => p.sector_id === sector.id) || []
                    const sectorKpis = allKpis?.filter((kpi: any) => kpi.processes?.sector_id === sector.id) || []

                    return (
                      <Link key={sector.id} href={`/dashboard/${sector.id}`}>
                        <div className="p-4 border rounded-lg hover:bg-muted cursor-pointer transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold">{sector.name}</h3>
                              <p className="text-sm text-muted-foreground">{sector.description}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-semibold">{sectorProcesses.length} processes</p>
                              <p className="text-muted-foreground">{sectorKpis.length} KPIs</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  })
                ) : (
                  <p className="text-center text-muted-foreground">No sectors found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
