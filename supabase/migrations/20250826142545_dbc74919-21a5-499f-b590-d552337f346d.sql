-- Fix security issues: Add missing RLS policies and update functions

-- Add missing RLS policies for direct_messages
CREATE POLICY "Users can view their direct messages" ON public.direct_messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can send direct messages" ON public.direct_messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Add missing RLS policies for meeting_attendees
CREATE POLICY "Users can view meeting attendees in their organization" ON public.meeting_attendees
  FOR SELECT USING (
    meeting_id IN (
      SELECT m.id FROM public.meetings m
      JOIN public.profiles p ON p.organization_id = m.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add missing RLS policies for files
CREATE POLICY "Users can view organization files" ON public.files
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload files" ON public.files
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Add missing RLS policies for meetings
CREATE POLICY "Users can view organization meetings" ON public.meetings
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meetings" ON public.meetings
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Add missing RLS policies for courses
CREATE POLICY "Users can view organization courses" ON public.courses
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Add missing RLS policies for lessons
CREATE POLICY "Users can view lessons in organization courses" ON public.lessons
  FOR SELECT USING (
    course_id IN (
      SELECT c.id FROM public.courses c
      JOIN public.profiles p ON p.organization_id = c.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Add missing RLS policies for time_tracking
CREATE POLICY "Users can view their own time tracking" ON public.time_tracking
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own time tracking" ON public.time_tracking
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Add missing RLS policies for leave_requests
CREATE POLICY "Users can view their own leave requests" ON public.leave_requests
  FOR SELECT USING (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (
    profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  );

-- Add missing RLS policies for forms
CREATE POLICY "Users can view organization forms" ON public.forms
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Add missing RLS policies for form_submissions (public access for submissions)
CREATE POLICY "Anyone can submit forms" ON public.form_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Organization members can view form submissions" ON public.form_submissions
  FOR SELECT USING (
    form_id IN (
      SELECT f.id FROM public.forms f
      JOIN public.profiles p ON p.organization_id = f.organization_id
      WHERE p.user_id = auth.uid()
    )
  );

-- Fix function security: Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;