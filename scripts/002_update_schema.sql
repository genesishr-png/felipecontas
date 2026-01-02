-- Update processes table with all required fields
DROP TABLE IF EXISTS public.processes CASCADE;

CREATE TABLE public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sector_id UUID NOT NULL REFERENCES public.sectors(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero_processo TEXT NOT NULL,
  data_entrada_proger DATE NOT NULL,
  interessado TEXT NOT NULL,
  data_com_responsavel DATE NOT NULL,
  objeto TEXT NOT NULL,
  responsavel TEXT NOT NULL,
  data_saida DATE,
  observacao TEXT,
  status TEXT DEFAULT 'open', -- 'open' or 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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
      WHERE user_id = auth.uid()
    ) AND owner_id = auth.uid()
  );

CREATE POLICY "Users can update their own processes"
  ON public.processes FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own processes"
  ON public.processes FOR DELETE
  USING (owner_id = auth.uid());
