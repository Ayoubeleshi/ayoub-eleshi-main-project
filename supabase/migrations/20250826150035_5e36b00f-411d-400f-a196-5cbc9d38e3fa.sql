-- Fix the infinite recursion in profiles RLS policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Create a new policy that allows users to see their own profile first, then others in same org
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can view organization profiles" 
ON public.profiles 
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  organization_id IN (
    SELECT organization_id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
  )
);