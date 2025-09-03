-- Enhance time_tracking table with break management and project linking
-- This migration adds new fields to support enhanced time tracking functionality

-- Add new columns to time_tracking table
ALTER TABLE public.time_tracking 
ADD COLUMN IF NOT EXISTS is_break BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS break_type TEXT CHECK (break_type IN ('lunch', 'coffee', 'quick', 'pause', 'general')),
ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Add index for better performance on break queries
CREATE INDEX IF NOT EXISTS idx_time_tracking_is_break ON public.time_tracking(is_break);
CREATE INDEX IF NOT EXISTS idx_time_tracking_profile_date ON public.time_tracking(profile_id, start_time);

-- Update existing RLS policies to include new fields
DROP POLICY IF EXISTS "Users can view their own time tracking" ON public.time_tracking;
CREATE POLICY "Users can view their own time tracking" ON public.time_tracking
  FOR SELECT USING (profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create their own time tracking" ON public.time_tracking;
CREATE POLICY "Users can create their own time tracking" ON public.time_tracking
  FOR INSERT WITH CHECK (profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update their own time tracking" ON public.time_tracking;
CREATE POLICY "Users can update their own time tracking" ON public.time_tracking
  FOR UPDATE USING (profile_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  ));

-- Add comment to document the new structure
COMMENT ON TABLE public.time_tracking IS 'Enhanced time tracking with break management and project linking';
COMMENT ON COLUMN public.time_tracking.is_break IS 'Whether this time entry is a break or work time';
COMMENT ON COLUMN public.time_tracking.break_type IS 'Type of break: lunch, coffee, quick, pause, or general';
COMMENT ON COLUMN public.time_tracking.task_id IS 'Optional link to a specific task/project';
