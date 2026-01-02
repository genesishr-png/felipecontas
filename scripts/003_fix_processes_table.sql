-- Add missing columns to processes table to match form requirements
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS numero_processo TEXT UNIQUE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_entrada_proger DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_com_responsavel DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS objeto TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_saida DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_processes_sector_id ON public.processes(sector_id);
CREATE INDEX IF NOT EXISTS idx_processes_owner_id ON public.processes(owner_id);
CREATE INDEX IF NOT EXISTS idx_processes_numero ON public.processes(numero_processo);
