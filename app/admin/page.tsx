import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboard } from "@/components/admin-dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all sectors
  const { data: sectors } = await supabase.from("sectors").select("*")

  // Get user's assigned sectors
  const { data: userSectors } = await supabase.from("user_sectors").select("*").eq("user_id", user.id)

  // Get all processes
  const { data: processes } = await supabase.from("processes").select("*")

  // Get all KPIs with process info
  const { data: allKpis } = await supabase.from("kpis").select("*, processes(name, sector_id, sectors(name))")

  // Get total users
  const { data: allUserSectors } = await supabase
    .from("user_sectors")
    .select("user_id", { count: "exact", head: false })

  const uniqueUsers = new Set(allUserSectors?.map((us) => us.user_id) || []).size

  return (
    <AdminDashboard
      sectors={sectors}
      userSectors={userSectors}
      processes={processes}
      allKpis={allKpis}
      uniqueUsers={uniqueUsers}
      user={user}
    />
  )
}
