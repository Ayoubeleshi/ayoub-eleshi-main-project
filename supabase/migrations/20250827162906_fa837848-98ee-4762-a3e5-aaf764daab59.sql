-- Add Google Calendar integration fields to calendars table
ALTER TABLE public.calendars 
ADD COLUMN google_calendar_id text,
ADD COLUMN google_access_token text,
ADD COLUMN google_refresh_token text,
ADD COLUMN google_token_expires_at timestamp with time zone,
ADD COLUMN last_sync_at timestamp with time zone,
ADD COLUMN sync_enabled boolean DEFAULT false;

-- Add Google Calendar sync status to events
ALTER TABLE public.events
ADD COLUMN google_event_id text,
ADD COLUMN last_synced_at timestamp with time zone,
ADD COLUMN sync_status text DEFAULT 'pending';

-- Create index for efficient Google Calendar lookups
CREATE INDEX idx_calendars_google_id ON public.calendars(google_calendar_id);
CREATE INDEX idx_events_google_id ON public.events(google_event_id);

-- Add Google integration accounts for users
CREATE TABLE public.google_integrations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id uuid NOT NULL,
  google_email text NOT NULL,
  access_token text NOT NULL,
  refresh_token text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  scope text[] NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on google_integrations
ALTER TABLE public.google_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for google_integrations
CREATE POLICY "Users can manage their own Google integrations"
ON public.google_integrations
FOR ALL
USING (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Create trigger for updated_at
CREATE TRIGGER update_google_integrations_updated_at
BEFORE UPDATE ON public.google_integrations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();