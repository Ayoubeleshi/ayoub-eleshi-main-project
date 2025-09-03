-- Add missing color column to folders table
ALTER TABLE public.folders 
ADD COLUMN color TEXT DEFAULT 'text-blue-600';