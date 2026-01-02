import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.POSTGRES_URL)

async function setupDatabase() {
  try {
    console.log("[v0] Starting database setup...")

    // Create sectors table
    await sql(`
      CREATE TABLE IF NOT EXISTS sectors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log("[v0] Created sectors table")

    // Create processes table
    await sql(`
      CREATE TABLE IF NOT EXISTS processes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        owner_id UUID NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log("[v0] Created processes table")

    // Create performance_metrics table
    await sql(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
        metric_name TEXT NOT NULL,
        target_value NUMERIC,
        current_value NUMERIC,
        unit TEXT,
        measurement_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log("[v0] Created performance_metrics table")

    // Create kpis table
    await sql(`
      CREATE TABLE IF NOT EXISTS kpis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        process_id UUID NOT NULL REFERENCES processes(id) ON DELETE CASCADE,
        kpi_name TEXT NOT NULL,
        metric_type TEXT NOT NULL,
        target_value NUMERIC,
        current_value NUMERIC,
        unit TEXT,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)
    console.log("[v0] Created kpis table")

    // Create user_sectors table
    await sql(`
      CREATE TABLE IF NOT EXISTS user_sectors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        sector_id UUID NOT NULL REFERENCES sectors(id) ON DELETE CASCADE,
        role TEXT DEFAULT 'viewer',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, sector_id)
      );
    `)
    console.log("[v0] Created user_sectors table")

    // Insert default sectors
    await sql(`
      INSERT INTO sectors (name, description) VALUES
        ('Licensing', 'License issuance and management processes'),
        ('Pensions', 'Pension fund and benefits management'),
        ('Legal Disputes', 'Legal case and dispute resolution'),
        ('Medical Assistance', 'Healthcare and medical assistance programs')
      ON CONFLICT (name) DO NOTHING;
    `)
    console.log("[v0] Inserted default sectors")

    console.log("[v0] Database setup completed successfully!")
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    process.exit(1)
  }
}

setupDatabase()
