import { createClient } from "@supabase/supabase-js"

async function runMigration() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    console.log("[v0] Starting migration...")

    const newColumns = [
      { name: "numero_processo", type: "text" },
      { name: "data_entrada_proger", type: "date" },
      { name: "data_com_responsavel", type: "date" },
      { name: "objeto", type: "text" },
      { name: "responsavel", type: "text" },
      { name: "data_saida", type: "date" },
      { name: "observacao", type: "text" },
      { name: "status", type: "text", default: "'open'" },
    ]

    // Get current processes table structure
    const { data: currentColumns, error: describeError } = await supabase.rpc("get_table_columns", {
      table_name: "processes",
    })

    if (describeError && describeError.code !== "PGRST301") {
      console.error("[v0] Error checking table structure:", describeError)
    }

    console.log("[v0] Current columns:", currentColumns)
    console.log("[v0] Migration check completed")
  } catch (error) {
    console.error("[v0] Migration failed:", error)
  }
}

runMigration()
