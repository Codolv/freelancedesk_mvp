-- Add project milestones table

CREATE TABLE project_milestones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue')),
    due_date TIMESTAMP WITH TIME ZONE,
    target_date TIMESTAMP WITH TIME ZONE,
    actual_completion_date TIMESTAMP WITH TIME ZONE,
    order_number INTEGER DEFAULT 0,
    profile_id UUID NOT NULL REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_milestones
CREATE INDEX idx_project_milestones_project_id ON project_milestones(project_id);
CREATE INDEX idx_project_milestones_status ON project_milestones(status);
CREATE INDEX idx_project_milestones_due_date ON project_milestones(due_date);
CREATE INDEX idx_project_milestones_profile_id ON project_milestones(profile_id);

-- RLS policy for project_milestones
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
