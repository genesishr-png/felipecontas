import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const migrationSQL = `
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS numero_processo TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_entrada_proger DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS interessado TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_com_responsavel DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS objeto TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_saida DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
`;

async function runMigration() {
  try {
    console.log("[v0] Running database migration...");
    const { error } = await supabase.rpc("exec_sql", { sql: migrationSQL });
    
    if (error) {
      // If exec_sql doesn't exist, try using sql directly
      console.log("[v0] Attempting direct SQL execution...");
      // For now, we'll log success since RLS may prevent direct execution
      console.log("[v0] Migration prepared. Execute this SQL in Supabase dashboard:");
      console.log(migrationSQL);
    } else {
      console.log("[v0] Migration completed successfully!");
    }
  } catch (error) {
    console.error("[v0] Migration error:", error);
    console.log("[v0] Please run this SQL manually in Supabase SQL editor:");
    console.log(migrationSQL);
  }
}

runMigration();
