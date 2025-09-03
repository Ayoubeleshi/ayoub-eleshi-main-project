-- Add missing RLS policies for tasks and projects tables

-- Add INSERT policy for tasks
CREATE POLICY "Users can create tasks in their organization" 
ON tasks 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
  AND created_by IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Add DELETE policy for tasks
CREATE POLICY "Users can delete their own tasks" 
ON tasks 
FOR DELETE 
USING (
  created_by IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
  AND organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Add INSERT policy for projects
CREATE POLICY "Users can create projects in their organization" 
ON projects 
FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
  AND created_by IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Add UPDATE policy for projects
CREATE POLICY "Users can update their own projects" 
ON projects 
FOR UPDATE 
USING (
  created_by IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
  AND organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);

-- Add DELETE policy for projects
CREATE POLICY "Users can delete their own projects" 
ON projects 
FOR DELETE 
USING (
  created_by IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
  AND organization_id IN (
    SELECT profiles.organization_id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
);