-- Create sectors table
CREATE TABLE IF NOT EXISTS public.sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create processes table
CREATE TABLE IF NOT EXISTS public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  measurement_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create kpis table
CREATE TABLE IF NOT EXISTS public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID NOT NULL REFERENCES public.processes(id) ON DELETE CASCADE,
  kpi_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- e.g., 'average_time', 'success_rate', 'volume'
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sectors table (for tracking user's sectors)
CREATE TABLE IF NOT EXISTS public.user_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer', -- 'admin', 'editor', 'viewer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, sector_id)
);

-- Enable RLS on all tables
ALTER TABLE public.sectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sectors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sectors
CREATE POLICY "Users can view sectors they have access to"
  ON public.sectors FOR SELECT
  USING (
    id IN (
      SELECT sector_id FROM public.user_sectors WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for processes
CREATE POLICY "Users can view processes in their sectors"
  ON public.processes FOR SELECT
  USING (
    sector_id IN (
      SELECT sector_id FROM public.user_sectors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert processes in their sectors"
  ON public.processes FOR INSERT
  WITH CHECK (
    sector_id IN (
      SELECT sector_id FROM public.user_sectors 
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    ) AND owner_id = auth.uid()
  );

CREATE POLICY "Users can update their own processes"
  ON public.processes FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own processes"
  ON public.processes FOR DELETE
  USING (owner_id = auth.uid());

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view metrics for accessible processes"
  ON public.performance_metrics FOR SELECT
  USING (
    process_id IN (
      SELECT id FROM public.processes WHERE sector_id IN (
        SELECT sector_id FROM public.user_sectors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert metrics for their processes"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (
    process_id IN (
      SELECT id FROM public.processes WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for kpis
CREATE POLICY "Users can view kpis for accessible processes"
  ON public.kpis FOR SELECT
  USING (
    process_id IN (
      SELECT id FROM public.processes WHERE sector_id IN (
        SELECT sector_id FROM public.user_sectors WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert kpis for their processes"
  ON public.kpis FOR INSERT
  WITH CHECK (
    process_id IN (
      SELECT id FROM public.processes WHERE owner_id = auth.uid()
    )
  );

-- RLS Policies for user_sectors
CREATE POLICY "Users can view their sector assignments"
  ON public.user_sectors FOR SELECT
  USING (user_id = auth.uid());

-- Insert default sectors
INSERT INTO public.sectors (name, description) VALUES
  ('Licensing', 'License issuance and management processes'),
  ('Pensions', 'Pension fund and benefits management'),
  ('Legal Disputes', 'Legal case and dispute resolution'),
  ('Medical Assistance', 'Healthcare and medical assistance programs')
ON CONFLICT (name) DO NOTHING;
