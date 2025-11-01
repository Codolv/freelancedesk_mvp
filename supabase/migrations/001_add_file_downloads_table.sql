-- Add file downloads tracking table
CREATE TABLE file_downloads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for file_downloads
CREATE INDEX idx_file_downloads_project_file ON file_downloads(project_id, file_name);
CREATE INDEX idx_file_downloads_user_id ON file_downloads(user_id);
CREATE INDEX idx_file_downloads_downloaded_at ON file_downloads(downloaded_at);

-- RLS policy for file downloads
CREATE POLICY "Project members can view file downloads" ON file_downloads FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_clients 
        WHERE project_clients.project_id = project_id AND project_clients.client_id = auth.uid()
    )
);
