-- Fix function search paths for security compliance
CREATE OR REPLACE FUNCTION public.get_channel_unread_count(p_channel_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_read TIMESTAMP WITH TIME ZONE;
  unread_count INTEGER;
BEGIN
  -- Get the last read timestamp for this user and channel
  SELECT last_read_at INTO last_read
  FROM user_channel_reads
  WHERE user_id = p_user_id AND channel_id = p_channel_id;
  
  -- If no read record exists, count all messages in the channel
  IF last_read IS NULL THEN
    SELECT COUNT(*) INTO unread_count
    FROM messages
    WHERE channel_id = p_channel_id;
  ELSE
    -- Count messages after the last read timestamp
    SELECT COUNT(*) INTO unread_count
    FROM messages
    WHERE channel_id = p_channel_id AND created_at > last_read;
  END IF;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix search path for DM unread count function
CREATE OR REPLACE FUNCTION public.get_dm_unread_count(p_dm_user_id UUID, p_current_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_read TIMESTAMP WITH TIME ZONE;
  unread_count INTEGER;
BEGIN
  -- Get the last read timestamp for this user and DM partner
  SELECT last_read_at INTO last_read
  FROM user_channel_reads
  WHERE user_id = p_current_user_id AND dm_user_id = p_dm_user_id;
  
  -- If no read record exists, count all messages from the DM partner
  IF last_read IS NULL THEN
    SELECT COUNT(*) INTO unread_count
    FROM direct_messages
    WHERE sender_id = p_dm_user_id AND recipient_id = p_current_user_id;
  ELSE
    -- Count messages from the DM partner after the last read timestamp
    SELECT COUNT(*) INTO unread_count
    FROM direct_messages
    WHERE sender_id = p_dm_user_id 
      AND recipient_id = p_current_user_id 
      AND created_at > last_read;
  END IF;
  
  RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;