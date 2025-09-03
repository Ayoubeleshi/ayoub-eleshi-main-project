-- Create message_reactions table for emoji reactions
CREATE TABLE public.message_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message reactions
CREATE POLICY "Users can add reactions to messages in their organization" 
ON public.message_reactions 
FOR INSERT 
WITH CHECK (
  message_id IN (
    SELECT m.id 
    FROM messages m
    JOIN channels c ON m.channel_id = c.id
    JOIN profiles p ON c.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
  ) AND user_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view reactions in their organization" 
ON public.message_reactions 
FOR SELECT 
USING (
  message_id IN (
    SELECT m.id 
    FROM messages m
    JOIN channels c ON m.channel_id = c.id
    JOIN profiles p ON c.organization_id = p.organization_id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own reactions" 
ON public.message_reactions 
FOR DELETE 
USING (
  user_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Add reply_to_message_id field to messages table for threading
ALTER TABLE public.messages ADD COLUMN reply_to_message_id UUID REFERENCES public.messages(id);

-- Add reply_to_message_id field to direct_messages table for threading
ALTER TABLE public.direct_messages ADD COLUMN reply_to_message_id UUID REFERENCES public.direct_messages(id);

-- Create indexes for better performance
CREATE INDEX idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON public.message_reactions(user_id);
CREATE INDEX idx_messages_reply_to ON public.messages(reply_to_message_id);
CREATE INDEX idx_direct_messages_reply_to ON public.direct_messages(reply_to_message_id);

-- Enable realtime for message_reactions
ALTER TABLE public.message_reactions REPLICA IDENTITY FULL;