import { createClient } from "@supabase/supabase-js"

export async function POST() {
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const updates = [
      { oldName: "Pensions", newName: "Pensões", description: "Gestão de fundos de pensão e benefícios" },
      { oldName: "Licensing", newName: "Licenciamento", description: "Processos de emissão e gestão de licenças" },
      { oldName: "Legal Disputes", newName: "Disputas Legais", description: "Resolução de casos legais e disputas" },
      {
        oldName: "Medical Assistance",
        newName: "Assistência Médica",
        description: "Programas de saúde e assistência médica",
      },
    ]

    for (const update of updates) {
      await supabaseAdmin
        .from("sectors")
        .update({ name: update.newName, description: update.description })
        .eq("name", update.oldName)
    }

    return Response.json({ success: true, message: "Sectors updated to Portuguese" })
  } catch (error) {
    console.error("Error updating sectors:", error)
    return Response.json({ error: "Failed to update sectors" }, { status: 500 })
  }
}
