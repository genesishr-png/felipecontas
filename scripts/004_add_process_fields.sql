-- Add missing columns to processes table if they don't exist
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS numero_processo TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_entrada_proger DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS interessado TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_com_responsavel DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS objeto TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS responsavel TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS data_saida DATE;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE public.processes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
