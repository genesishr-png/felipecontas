import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProcessDetailDashboard } from "@/components/process-detail-dashboard"

interface Props {
  params: Promise<{ processId: string }>
}

export default async function ProcessPage({ params }: Props) {
  const { processId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get process details
  const { data: process } = await supabase.from("processes").select("*").eq("id", processId).single()

  if (!process) {
    redirect("/sectors")
  }

  // Verify user has access to this process's sector
  const { data: userSector } = await supabase
    .from("user_sectors")
    .select("*")
    .eq("user_id", user.id)
    .eq("sector_id", process.sector_id)
    .single()

  if (!userSector) {
    redirect("/sectors")
  }

  // Get sector info
  const { data: sector } = await supabase.from("sectors").select("*").eq("id", process.sector_id).single()

  // Get KPIs for this process
  const { data: kpis } = await supabase.from("kpis").select("*").eq("process_id", processId)

  // Get performance metrics
  const { data: metrics } = await supabase
    .from("performance_metrics")
    .select("*")
    .eq("process_id", processId)
    .order("measurement_date", { ascending: false })
    .limit(30)

  return <ProcessDetailDashboard process={process} sector={sector} kpis={kpis} metrics={metrics} user={user} />
}
