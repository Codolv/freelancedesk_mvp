-- Drop created_by column from project_milestones table

-- Remove the created_by column if it exists
ALTER TABLE project_milestones DROP COLUMN IF EXISTS created_by;

-- Update RLS policy to remove reference to created_by and revert to using profile_id
DROP POLICY IF EXISTS "Project members can manage milestones" ON project_milestones;

CREATE POLICY "Project members can manage milestones" ON project_milestones FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_clients 
        WHERE project_clients.project_id = project_id AND project_clients.client_id = auth.uid()
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON project_milestones TO authenticated;
