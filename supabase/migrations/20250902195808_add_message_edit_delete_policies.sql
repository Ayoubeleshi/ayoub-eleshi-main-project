-- Add missing UPDATE and DELETE policies for messages and direct_messages
-- This migration adds the missing policies that allow users to edit and delete their own messages

-- Messages table policies
CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (
    sender_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own messages" ON public.messages
  FOR DELETE USING (
    sender_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Direct messages table policies
CREATE POLICY "Users can view direct messages" ON public.direct_messages
  FOR SELECT USING (
    sender_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    ) OR recipient_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    sender_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own direct messages" ON public.direct_messages
  FOR UPDATE USING (
    sender_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own direct messages" ON public.direct_messages
  FOR DELETE USING (
    sender_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );
