-- Check if reply_to_message_id column exists, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' AND column_name = 'reply_to_message_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN reply_to_message_id UUID REFERENCES public.messages(id);
    CREATE INDEX idx_messages_reply_to ON public.messages(reply_to_message_id);
  END IF;
END $$;

-- Check if reply_to_message_id column exists in direct_messages, if not add it
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'direct_messages' AND column_name = 'reply_to_message_id'
  ) THEN
    ALTER TABLE public.direct_messages ADD COLUMN reply_to_message_id UUID REFERENCES public.direct_messages(id);
    CREATE INDEX idx_direct_messages_reply_to ON public.direct_messages(reply_to_message_id);
  END IF;
END $$;

-- Enable realtime for message_reactions table
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;