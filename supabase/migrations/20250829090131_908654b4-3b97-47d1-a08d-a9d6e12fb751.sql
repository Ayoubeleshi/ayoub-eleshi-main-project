-- Create RPC functions for task management with proper organization scoping

-- Function to create a task with proper organization scoping
CREATE OR REPLACE FUNCTION create_task(
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'not_started',
  p_priority TEXT DEFAULT 'medium',
  p_due_date TIMESTAMPTZ DEFAULT NULL,
  p_assigned_to UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_organization_id UUID;
  v_result tasks;
BEGIN
  -- Get current user's profile and organization
  SELECT id, organization_id INTO v_profile_id, v_organization_id
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Validate assignee belongs to same organization if provided
  IF p_assigned_to IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = p_assigned_to AND organization_id = v_organization_id
    ) THEN
      RAISE EXCEPTION 'Assignee must belong to the same organization';
    END IF;
  END IF;
  
  -- Validate project belongs to same organization if provided
  IF p_project_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM projects 
      WHERE id = p_project_id AND organization_id = v_organization_id
    ) THEN
      RAISE EXCEPTION 'Project must belong to the same organization';
    END IF;
  END IF;
  
  -- Insert the task
  INSERT INTO tasks (
    title, description, status, priority, due_date, 
    assigned_to, project_id, created_by, organization_id
  ) VALUES (
    p_title, p_description, p_status, p_priority, p_due_date,
    p_assigned_to, p_project_id, v_profile_id, v_organization_id
  )
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Function to update a task with proper validation
CREATE OR REPLACE FUNCTION update_task(
  p_task_id UUID,
  p_title TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_priority TEXT DEFAULT NULL,
  p_due_date TIMESTAMPTZ DEFAULT NULL,
  p_assigned_to UUID DEFAULT NULL,
  p_project_id UUID DEFAULT NULL
)
RETURNS tasks
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_organization_id UUID;
  v_result tasks;
BEGIN
  -- Get current user's profile and organization
  SELECT id, organization_id INTO v_profile_id, v_organization_id
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Validate task belongs to user's organization
  IF NOT EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = p_task_id AND organization_id = v_organization_id
  ) THEN
    RAISE EXCEPTION 'Task not found or access denied';
  END IF;
  
  -- Validate assignee belongs to same organization if provided
  IF p_assigned_to IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = p_assigned_to AND organization_id = v_organization_id
    ) THEN
      RAISE EXCEPTION 'Assignee must belong to the same organization';
    END IF;
  END IF;
  
  -- Validate project belongs to same organization if provided
  IF p_project_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM projects 
      WHERE id = p_project_id AND organization_id = v_organization_id
    ) THEN
      RAISE EXCEPTION 'Project must belong to the same organization';
    END IF;
  END IF;
  
  -- Update the task
  UPDATE tasks SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    status = COALESCE(p_status, status),
    priority = COALESCE(p_priority, priority),
    due_date = COALESCE(p_due_date, due_date),
    assigned_to = COALESCE(p_assigned_to, assigned_to),
    project_id = COALESCE(p_project_id, project_id),
    updated_at = now()
  WHERE id = p_task_id
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;

-- Function to delete a task with proper validation
CREATE OR REPLACE FUNCTION delete_task(p_task_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_organization_id UUID;
BEGIN
  -- Get current user's profile and organization
  SELECT id, organization_id INTO v_profile_id, v_organization_id
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Validate task belongs to user's organization and user created it
  IF NOT EXISTS (
    SELECT 1 FROM tasks 
    WHERE id = p_task_id 
    AND organization_id = v_organization_id 
    AND created_by = v_profile_id
  ) THEN
    RAISE EXCEPTION 'Task not found or access denied';
  END IF;
  
  -- Delete the task
  DELETE FROM tasks WHERE id = p_task_id;
  
  RETURN TRUE;
END;
$$;

-- Function to create a project/board with proper organization scoping
CREATE OR REPLACE FUNCTION create_project(
  p_name TEXT,
  p_description TEXT DEFAULT NULL,
  p_status TEXT DEFAULT 'active'
)
RETURNS projects
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
  v_organization_id UUID;
  v_result projects;
BEGIN
  -- Get current user's profile and organization
  SELECT id, organization_id INTO v_profile_id, v_organization_id
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Insert the project
  INSERT INTO projects (
    name, description, status, created_by, organization_id
  ) VALUES (
    p_name, p_description, p_status, v_profile_id, v_organization_id
  )
  RETURNING * INTO v_result;
  
  RETURN v_result;
END;
$$;