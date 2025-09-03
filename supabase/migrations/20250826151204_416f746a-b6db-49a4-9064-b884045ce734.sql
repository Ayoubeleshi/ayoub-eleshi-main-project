-- Phase 1: Fix Data Foundation
-- Create a default organization for existing users
INSERT INTO public.organizations (id, name, slug, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Default Organization', 
  'default-org',
  now(),
  now()
) ON CONFLICT DO NOTHING;

-- Update existing user profiles to belong to the default organization
UPDATE public.profiles 
SET organization_id = (
  SELECT id FROM public.organizations WHERE slug = 'default-org' LIMIT 1
)
WHERE organization_id IS NULL;

-- Update the handle_new_user function to create organizations during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  org_id uuid;
  org_name text;
BEGIN
  -- Extract organization name from metadata or use default
  org_name := COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization');
  
  -- Create a new organization for the user
  INSERT INTO public.organizations (name, slug, created_at, updated_at)
  VALUES (
    org_name,
    lower(replace(org_name, ' ', '-')) || '-' || substring(NEW.id::text from 1 for 8),
    now(),
    now()
  )
  RETURNING id INTO org_id;
  
  -- Create the user profile with the new organization
  INSERT INTO public.profiles (user_id, email, full_name, organization_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    org_id
  );
  
  RETURN NEW;
END;
$$;