-- Create folders table for organizing files
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  created_by UUID NOT NULL,
  icon TEXT DEFAULT 'folder',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Add folder_id and tags columns to existing files table
ALTER TABLE public.files 
ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create policies for folders table
CREATE POLICY "Users can view organization folders" 
ON public.folders 
FOR SELECT 
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create folders in their organization" 
ON public.folders 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE user_id = auth.uid()
  ) AND 
  created_by IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their organization folders" 
ON public.folders 
FOR UPDATE 
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete their organization folders" 
ON public.folders 
FOR DELETE 
USING (organization_id IN (
  SELECT organization_id FROM profiles WHERE user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates on folders
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();