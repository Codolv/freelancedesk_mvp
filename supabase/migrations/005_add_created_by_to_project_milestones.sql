-- Add created_by column to project_milestones table

ALTER TABLE project_milestones 
ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update existing records to have created_by set to profile_id for consistency
UPDATE project_milestones 
SET created_by = profile_id 
WHERE created_by IS NULL;

-- Make created_by column NOT NULL and add a foreign key constraint
ALTER TABLE project_milestones 
ALTER COLUMN created_by SET NOT NULL;

-- Add index for performance
CREATE INDEX idx_project_milestones_created_by ON project_milestones(created_by);

-- Update RLS policy to use created_by instead of profile_id for more accurate permissions
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
    OR created_by = auth.uid()
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON project_milestones TO authenticated;
