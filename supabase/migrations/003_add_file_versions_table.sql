-- Add file versions table for version tracking
CREATE TABLE file_versions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    file_path TEXT NOT NULL, -- Storage path for this specific version
    size_bytes INTEGER,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Index for file_versions
CREATE INDEX idx_file_versions_project_file_id ON file_versions(project_file_id);
CREATE INDEX idx_file_versions_version_number ON file_versions(version_number);
CREATE INDEX idx_file_versions_created_at ON file_versions(created_at);

-- RLS policy for file versions
CREATE POLICY "Project members can view file versions" ON file_versions FOR ALL USING (
    EXISTS (
        SELECT 1 FROM project_files pf
        WHERE pf.id = project_file_id
        AND EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = pf.project_id AND p.user_id = auth.uid()
        )
    )
    OR EXISTS (
        SELECT 1 FROM project_files pf
        JOIN project_clients pc ON pc.project_id = pf.project_id
        WHERE pf.id = project_file_id AND pc.client_id = auth.uid()
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON file_versions TO authenticated;

-- Update project_files table to support versioning better
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES file_versions(id);
ALTER TABLE project_files ADD COLUMN IF NOT EXISTS total_versions INTEGER DEFAULT 1;

-- Update the version column to be auto-incrementing based on file_versions count
CREATE OR REPLACE FUNCTION update_file_version_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE project_files
    SET total_versions = (
        SELECT COUNT(*) FROM file_versions WHERE project_file_id = NEW.project_file_id
    ),
    version = (
        SELECT COUNT(*) FROM file_versions WHERE project_file_id = NEW.project_file_id
    )
    WHERE id = NEW.project_file_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for version updates
CREATE TRIGGER trigger_update_version_count
    AFTER INSERT ON file_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_file_version_count();
