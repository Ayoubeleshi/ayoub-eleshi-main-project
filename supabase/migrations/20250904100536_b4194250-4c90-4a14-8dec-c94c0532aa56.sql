-- Create a security definer function to safely get calendar data for sync
-- This function ensures proper ownership validation without exposing tokens
CREATE OR REPLACE FUNCTION public.get_calendar_for_sync(
  p_calendar_id uuid,
  p_profile_id uuid
)
RETURNS TABLE (
  id uuid,
  google_calendar_id text,
  name text,
  owner_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the profile exists and belongs to current user
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_profile_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Return only safe calendar data for the owner
  RETURN QUERY
  SELECT 
    c.id,
    c.google_calendar_id,
    c.name,
    c.owner_id
  FROM calendars c
  WHERE c.id = p_calendar_id 
    AND c.owner_id = p_profile_id;
END;
$$;

-- Create a security definer function to safely get Google integration tokens
-- This ensures tokens can only be accessed by their owner
CREATE OR REPLACE FUNCTION public.get_google_tokens_for_sync(
  p_profile_id uuid
)
RETURNS TABLE (
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verify the profile exists and belongs to current user
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_profile_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized access';
  END IF;

  -- Return tokens only for the requesting user
  RETURN QUERY
  SELECT 
    gi.access_token,
    gi.refresh_token,
    gi.expires_at
  FROM google_integrations gi
  WHERE gi.profile_id = p_profile_id 
    AND gi.is_active = true;
END;
$$;