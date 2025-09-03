-- Create enhanced calendar system tables

-- Calendars table (replaces basic meetings approach)
CREATE TABLE IF NOT EXISTS public.calendars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'local' CHECK (type IN ('local', 'google', 'outlook')),
  color TEXT NOT NULL DEFAULT '#3b82f6',
  sharing TEXT NOT NULL DEFAULT 'private' CHECK (sharing IN ('private', 'team', 'public')),
  external_calendar_id TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events table (enhanced from meetings)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  calendar_id UUID REFERENCES public.calendars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  online_provider TEXT CHECK (online_provider IN ('google_meet', 'zoom', 'teams', 'custom')),
  online_join_url TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  rrule TEXT, -- Recurrence rule (RFC 5545)
  color TEXT,
  created_by UUID REFERENCES public.profiles(id),
  updated_by UUID REFERENCES public.profiles(id),
  source TEXT NOT NULL DEFAULT 'local' CHECK (source IN ('local', 'google', 'outlook')),
  external_event_id TEXT,
  timezone TEXT DEFAULT 'UTC',
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'tentative', 'cancelled')),
  visibility TEXT DEFAULT 'default' CHECK (visibility IN ('default', 'public', 'private')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Event attendees (enhanced from meeting_attendees)
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  profile_id UUID REFERENCES public.profiles(id), -- NULL for external attendees
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')),
  is_organizer BOOLEAN DEFAULT false,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'whatsapp')),
  minutes_before INTEGER NOT NULL DEFAULT 10,
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Integration accounts table
CREATE TABLE IF NOT EXISTS public.integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'outlook', 'zoom')),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scope TEXT[],
  account_email TEXT,
  account_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider, account_email)
);

-- Enable RLS on all tables
ALTER TABLE public.calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calendars
CREATE POLICY "Users can view calendars in their organization"
  ON public.calendars FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create calendars in their organization"
  ON public.calendars FOR INSERT
  WITH CHECK (
    owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) AND
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Calendar owners can update their calendars"
  ON public.calendars FOR UPDATE
  USING (
    owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Calendar owners can delete their calendars"
  ON public.calendars FOR DELETE
  USING (
    owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for events
CREATE POLICY "Users can view events in accessible calendars"
  ON public.events FOR SELECT
  USING (
    calendar_id IN (
      SELECT c.id FROM public.calendars c
      JOIN public.profiles p ON p.organization_id = c.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in calendars they own or have access to"
  ON public.events FOR INSERT
  WITH CHECK (
    calendar_id IN (
      SELECT c.id FROM public.calendars c
      JOIN public.profiles p ON p.id = c.owner_id
      WHERE p.user_id = auth.uid()
    ) AND
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators can update their events"
  ON public.events FOR UPDATE
  USING (
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Event creators can delete their events"
  ON public.events FOR DELETE
  USING (
    created_by IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for event_attendees
CREATE POLICY "Users can view attendees for events they can see"
  ON public.event_attendees FOR SELECT
  USING (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.calendars c ON c.id = e.calendar_id
      JOIN public.profiles p ON p.organization_id = c.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add attendees to events they created"
  ON public.event_attendees FOR INSERT
  WITH CHECK (
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.profiles p ON p.id = e.created_by
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own attendance or if they created the event"
  ON public.event_attendees FOR UPDATE
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) OR
    event_id IN (
      SELECT e.id FROM public.events e
      JOIN public.profiles p ON p.id = e.created_by
      WHERE p.user_id = auth.uid()
    )
  );

-- RLS Policies for reminders
CREATE POLICY "Users can manage their own reminders"
  ON public.reminders FOR ALL
  USING (
    profile_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for integration_accounts
CREATE POLICY "Users can manage their own integration accounts"
  ON public.integration_accounts FOR ALL
  USING (
    user_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_calendars_organization_id ON public.calendars(organization_id);
CREATE INDEX idx_calendars_owner_id ON public.calendars(owner_id);
CREATE INDEX idx_events_calendar_id ON public.events(calendar_id);
CREATE INDEX idx_events_start_at ON public.events(start_at);
CREATE INDEX idx_events_end_at ON public.events(end_at);
CREATE INDEX idx_events_created_by ON public.events(created_by);
CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_profile_id ON public.event_attendees(profile_id);
CREATE INDEX idx_reminders_event_id ON public.reminders(event_id);
CREATE INDEX idx_integration_accounts_user_id ON public.integration_accounts(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_calendars_updated_at
  BEFORE UPDATE ON public.calendars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_integration_accounts_updated_at
  BEFORE UPDATE ON public.integration_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default calendar for existing users
INSERT INTO public.calendars (name, owner_id, organization_id, type, color, is_primary)
SELECT 
  'My Calendar',
  p.id,
  p.organization_id,
  'local',
  '#3b82f6',
  true
FROM public.profiles p
WHERE p.organization_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Enable realtime for calendar tables
ALTER TABLE public.calendars REPLICA IDENTITY FULL;
ALTER TABLE public.events REPLICA IDENTITY FULL;
ALTER TABLE public.event_attendees REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.calendars;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;