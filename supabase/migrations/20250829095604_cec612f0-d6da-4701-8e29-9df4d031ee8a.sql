-- Test: Create a seed task to verify the system works when authenticated
-- This will demonstrate the complete flow works once user logs in

-- First, let's create a test task manually (simulating what happens when user creates a task)
-- Using the existing project ID: 5e3f9480-27c9-4a8d-8fd0-1ff9a34fc863
-- Using the existing profile ID: d905a2e2-9d45-4b19-b5db-735a8e54c51f (muhammad)
-- Using the existing organization ID: 8264e705-4232-4c85-9962-78fadd9a0abf

INSERT INTO tasks (
  title,
  description, 
  status,
  priority,
  project_id,
  created_by,
  organization_id
) VALUES (
  'Seed Test Task',
  'This task verifies the kanban board displays correctly',
  'not_started',
  'medium',
  '5e3f9480-27c9-4a8d-8fd0-1ff9a34fc863',
  'd905a2e2-9d45-4b19-b5db-735a8e54c51f',
  '8264e705-4232-4c85-9962-78fadd9a0abf'
);

-- Verify the task was created
SELECT id, title, status, project_id FROM tasks WHERE title = 'Seed Test Task';