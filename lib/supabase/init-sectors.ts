import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function initializeSectorsForUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    },
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    // Check if user already has sectors assigned
    const { data: userSectors } = await supabase.from("user_sectors").select("*").eq("user_id", user.id)

    if (userSectors && userSectors.length > 0) {
      return userSectors
    }

    // Get all sectors
    const { data: sectors } = await supabase.from("sectors").select("*")

    if (!sectors || sectors.length === 0) {
      return null
    }

    // Assign all sectors to the user as admin
    const { data: newUserSectors, error } = await supabase
      .from("user_sectors")
      .insert(
        sectors.map((sector) => ({
          user_id: user.id,
          sector_id: sector.id,
          role: "admin",
        })),
      )
      .select()

    if (error) {
      console.error("Error assigning sectors:", error)
      return null
    }

    return newUserSectors
  } catch (error) {
    console.error("Error initializing sectors:", error)
    return null
  }
}
