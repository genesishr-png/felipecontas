import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminAnalytics } from "@/components/admin-analytics"

export default async function AdminAnalyticsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all KPIs across all processes
  const { data: allKpis } = await supabase.from("kpis").select("*, processes(name, sector_id, sectors(name))")

  // Get all metrics
  const { data: allMetrics } = await supabase
    .from("performance_metrics")
    .select("*, processes(name, sector_id, sectors(name))")
    .order("measurement_date", { ascending: false })
    .limit(100)

  // Get all processes grouped by sector
  const { data: processes } = await supabase.from("processes").select("*, sectors(name)")

  return <AdminAnalytics allKpis={allKpis} allMetrics={allMetrics} processes={processes} user={user} />
}
