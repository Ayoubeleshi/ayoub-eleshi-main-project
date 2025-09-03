-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policy that causes circular dependency
DROP POLICY IF EXISTS "Users can view organization profiles" ON public.profiles;

-- Create new policies that don't cause recursion
-- Users can always view their own profile (base case)
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT 
USING (user_id = auth.uid());

-- Users can view other profiles in their organization
-- This uses a more direct approach without recursion
CREATE POLICY "Users can view organization profiles" ON public.profiles
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  organization_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.user_id = auth.uid() 
    AND p2.organization_id = profiles.organization_id
  )
);

-- Ensure users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Ensure users can update their own profile
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE 
USING (user_id = auth.uid());