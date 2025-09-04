-- Add unread message tracking
CREATE TABLE public.user_channel_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel_id UUID,
  dm_user_id UUID,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT user_channel_reads_user_channel_unique UNIQUE(user_id, channel_id),
  CONSTRAINT user_channel_reads_user_dm_unique UNIQUE(user_id, dm_user_id),
  CONSTRAINT user_channel_reads_channel_or_dm CHECK (
    (channel_id IS NOT NULL AND dm_user_id IS NULL) OR 
    (channel_id IS NULL AND dm_user_id IS NOT NULL)
  )
);

-- Enable RLS
ALTER TABLE public.user_channel_reads ENABLE ROW LEVEL SECURITY;

-- Create policies for user channel reads
CREATE POLICY "Users can view their own read status"
ON public.user_channel_reads
FOR SELECT
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can create their own read status"
ON public.user_channel_reads
FOR INSERT
WITH CHECK (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

CREATE POLICY "Users can update their own read status"
ON public.user_channel_reads
FOR UPDATE
USING (user_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_channel_reads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_channel_reads_updated_at
  BEFORE UPDATE ON public.user_channel_reads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_channel_reads_updated_at();

-- Create function to get unread counts for channels
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get unread counts for direct messages
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
$$ LANGUAGE plpgsql SECURITY DEFINER;