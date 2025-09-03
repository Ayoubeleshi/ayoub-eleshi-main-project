-- Fix the specific policy causing infinite recursion
-- Drop and recreate the problematic "Users can view organization profiles" policy
DROP POLICY IF EXISTS "Users can view organization profiles" ON public.profiles;

-- Create new policy that doesn't cause recursion by using a security definer function
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create the new policy using the function to avoid recursion
CREATE POLICY "Users can view organization profiles" ON public.profiles
FOR SELECT 
USING (
  user_id != auth.uid() AND 
  organization_id IS NOT NULL AND 
  organization_id = public.get_current_user_organization_id()
);