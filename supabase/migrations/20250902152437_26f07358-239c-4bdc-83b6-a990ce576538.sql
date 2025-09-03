-- Add RLS policies for channel_members table
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

-- Users can view channel members in their organization
CREATE POLICY "Users can view channel members in their organization"
ON channel_members FOR SELECT
TO authenticated
USING (
  channel_id IN (
    SELECT c.id FROM channels c
    JOIN profiles p ON p.organization_id = c.organization_id
    WHERE p.user_id = auth.uid()
  )
);

-- Users can add members to channels they created or moderate
CREATE POLICY "Users can add members to channels"
ON channel_members FOR INSERT
TO authenticated
WITH CHECK (
  channel_id IN (
    SELECT c.id FROM channels c
    JOIN profiles p ON p.organization_id = c.organization_id
    WHERE p.user_id = auth.uid()
    AND (c.created_by = p.id OR EXISTS (
      SELECT 1 FROM channel_members cm
      WHERE cm.channel_id = c.id AND cm.user_id = p.id AND cm.is_moderator = true
    ))
  )
);

-- Users can remove members from channels they created or moderate
CREATE POLICY "Users can remove members from channels"
ON channel_members FOR DELETE
TO authenticated
USING (
  channel_id IN (
    SELECT c.id FROM channels c
    JOIN profiles p ON p.organization_id = c.organization_id
    WHERE p.user_id = auth.uid()
    AND (c.created_by = p.id OR EXISTS (
      SELECT 1 FROM channel_members cm
      WHERE cm.channel_id = c.id AND cm.user_id = p.id AND cm.is_moderator = true
    ))
  )
);

-- Create a table for call sessions
CREATE TABLE call_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  direct_message_user_id UUID, -- For DM calls, reference to the other user's profile
  call_type TEXT NOT NULL DEFAULT 'voice', -- 'voice' or 'video'
  status TEXT NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'ended'
  started_by UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  organization_id UUID NOT NULL,
  participants JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on call_sessions
ALTER TABLE call_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view calls in their organization
CREATE POLICY "Users can view calls in their organization"
ON call_sessions FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Users can create calls in their organization
CREATE POLICY "Users can create calls"
ON call_sessions FOR INSERT
TO authenticated
WITH CHECK (
  started_by IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
  AND organization_id IN (
    SELECT profiles.organization_id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Users can update calls they started
CREATE POLICY "Users can update their calls"
ON call_sessions FOR UPDATE
TO authenticated
USING (
  started_by IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Add trigger for updating timestamps
CREATE TRIGGER update_call_sessions_updated_at
  BEFORE UPDATE ON call_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create call participants table
CREATE TABLE call_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'invited', -- 'invited', 'joined', 'left', 'declined'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on call_participants
ALTER TABLE call_participants ENABLE ROW LEVEL SECURITY;

-- Users can view call participants in their organization
CREATE POLICY "Users can view call participants"
ON call_participants FOR SELECT
TO authenticated
USING (
  call_id IN (
    SELECT cs.id FROM call_sessions cs
    JOIN profiles p ON p.organization_id = cs.organization_id
    WHERE p.user_id = auth.uid()
  )
);

-- Users can join calls
CREATE POLICY "Users can join calls"
ON call_participants FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Users can update their own participation
CREATE POLICY "Users can update their participation"
ON call_participants FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_channel_members_channel_id ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user_id ON channel_members(user_id);
CREATE INDEX idx_call_sessions_organization_id ON call_sessions(organization_id);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_participants_call_id ON call_participants(call_id);
CREATE INDEX idx_call_participants_user_id ON call_participants(user_id);