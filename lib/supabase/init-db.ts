import { createClient } from "@supabase/supabase-js"

export async function initializeDatabase() {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const { data: tableCheck } = await supabaseAdmin.from("sectors").select("id").limit(1)

    if (tableCheck !== null) {
      // Table exists, check if it has data
      const { count } = await supabaseAdmin.from("sectors").select("*", { count: "exact", head: true })

      if (count === 0) {
        // Insert default sectors
        await supabaseAdmin.from("sectors").insert([
          { name: "Licenciamento", description: "Processos de emissão e gestão de licenças" },
          { name: "Pensões", description: "Gestão de fundos de pensão e benefícios" },
          { name: "Disputas Legais", description: "Resolução de casos legais e disputas" },
          { name: "Assistência Médica", description: "Programas de saúde e assistência médica" },
        ])
      }

      try {
        const migrateResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/migrate`,
          { method: "POST", headers: { "Content-Type": "application/json" } },
        )
        console.log("[v0] Migration check completed:", await migrateResponse.json())
      } catch (migrationErr) {
        console.log("[v0] Migration check skipped, columns may already exist")
      }

      return true
    }
  } catch (error) {
    console.error("[v0] DB init check failed:", error)
  }

  return false
}

export async function assignSectorsToUser(userId: string) {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    // Get all sectors
    const { data: sectors } = await supabaseAdmin.from("sectors").select("id")

    if (!sectors || sectors.length === 0) {
      return false
    }

    // Check if user already has sectors assigned
    const { data: existingAssignments } = await supabaseAdmin.from("user_sectors").select("id").eq("user_id", userId)

    if (existingAssignments && existingAssignments.length > 0) {
      return true
    }

    // Assign all sectors to the user
    const assignments = sectors.map((sector) => ({
      user_id: userId,
      sector_id: sector.id,
      role: "admin",
    }))

    const { error } = await supabaseAdmin.from("user_sectors").insert(assignments)

    if (error) {
      console.error("[v0] Error assigning sectors:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("[v0] Error in assignSectorsToUser:", error)
    return false
  }
}
