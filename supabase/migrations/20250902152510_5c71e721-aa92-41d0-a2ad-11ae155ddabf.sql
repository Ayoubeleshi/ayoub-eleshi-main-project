-- Fix missing RLS policies for tables that have RLS enabled but no policies

-- Add policies for dm_participants
CREATE POLICY "Users can view their own DM participants"
ON dm_participants FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add themselves to DMs"
ON dm_participants FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

-- Add policies for message_files  
CREATE POLICY "Users can view message files in their organization"
ON message_files FOR SELECT
TO authenticated
USING (
  message_id IN (
    SELECT m.id FROM messages m
    JOIN channels c ON m.channel_id = c.id
    JOIN profiles p ON c.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can upload message files"
ON message_files FOR INSERT  
TO authenticated
WITH CHECK (
  message_id IN (
    SELECT m.id FROM messages m
    JOIN channels c ON m.channel_id = c.id
    JOIN profiles p ON c.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
  )
);

-- Add policies for user_presence
CREATE POLICY "Users can view presence in their organization"
ON user_presence FOR SELECT
TO authenticated
USING (
  organization_id IN (
    SELECT profiles.organization_id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own presence"
ON user_presence FOR INSERT
TO authenticated
WITH CHECK (
  user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own presence"
ON user_presence FOR UPDATE
TO authenticated
USING (
  user_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);