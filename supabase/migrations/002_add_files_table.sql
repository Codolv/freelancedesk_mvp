-- Add files table for project file management

CREATE TABLE project_files (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    path TEXT NOT NULL, -- Storage path in Supabase storage
    size_bytes INTEGER,
    mime_type TEXT,
    description TEXT,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for project_files
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX idx_project_files_created_at ON project_files(created_at);

-- RLS policy for project_files
CREATE POLICY "Project members can manage files" ON project_files FOR ALL USING (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON project_files TO authenticated;
