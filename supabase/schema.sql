-- Freelancedesk MVP Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (linked to Supabase auth users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    linkedin TEXT,
    twitter TEXT,
    website TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for profiles
CREATE INDEX idx_profiles_email ON profiles(email);

-- Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    deadline TIMESTAMP WITH TIME ZONE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for projects
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(deadline);

-- Project clients (many-to-many relationship)
CREATE TABLE project_clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, client_id)
);

-- Index for project_clients
CREATE INDEX idx_project_clients_project_id ON project_clients(project_id);
CREATE INDEX idx_project_clients_client_id ON project_clients(client_id);

-- Project invites
CREATE TABLE project_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    accepted BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project_invites
CREATE INDEX idx_project_invites_project_id ON project_invites(project_id);
CREATE INDEX idx_project_invites_email ON project_invites(email);
CREATE INDEX idx_project_invites_token ON project_invites(token);

-- Project todos
CREATE TABLE project_todos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project_todos
CREATE INDEX idx_project_todos_project_id ON project_todos(project_id);
CREATE INDEX idx_project_todos_completed ON project_todos(completed);
CREATE INDEX idx_project_todos_created_by ON project_todos(created_by);

-- Project invoices
CREATE TABLE project_invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    amount_cents INTEGER, -- Amount in cents to avoid floating point issues
    currency TEXT DEFAULT 'EUR',
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project_invoices
CREATE INDEX idx_project_invoices_project_id ON project_invoices(project_id);
CREATE INDEX idx_project_invoices_status ON project_invoices(status);
CREATE INDEX idx_project_invoices_due_date ON project_invoices(due_date);

-- Project invoice items
CREATE TABLE project_invoice_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES project_invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price_cents INTEGER NOT NULL, -- Price in cents
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project_invoice_items
CREATE INDEX idx_project_invoice_items_invoice_id ON project_invoice_items(invoice_id);

-- Project messages
CREATE TABLE project_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project_messages
CREATE INDEX idx_project_messages_project_id ON project_messages(project_id);
CREATE INDEX idx_project_messages_user_id ON project_messages(user_id);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Project clients policies
CREATE POLICY "Project owners can manage clients" ON project_clients FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Clients can view own project associations" ON project_clients FOR SELECT USING (auth.uid() = client_id);

-- Project invites policies
CREATE POLICY "Project owners can manage invites" ON project_invites FOR ALL USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_id AND projects.user_id = auth.uid())
);

-- Project todos policies
CREATE POLICY "Project members can manage todos" ON project_todos FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_clients 
        WHERE project_clients.project_id = project_id AND project_clients.client_id = auth.uid()
    )
);

-- Project invoices policies
CREATE POLICY "Project members can manage invoices" ON project_invoices FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_clients 
        WHERE project_clients.project_id = project_id AND project_clients.client_id = auth.uid()
    )
);

-- Project invoice items policies
CREATE POLICY "Invoice owners can manage items" ON project_invoice_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM project_invoices 
        WHERE project_invoices.id = invoice_id 
        AND EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = project_invoices.project_id AND projects.user_id = auth.uid()
        )
    )
);

-- Project messages policies
CREATE POLICY "Project members can manage messages" ON project_messages FOR ALL USING (
    EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id = project_id AND projects.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM project_clients 
        WHERE project_clients.project_id = project_id AND project_clients.client_id = auth.uid()
    )
);

-- Storage configuration for avatars and files
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('files', 'files', false);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatar images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own avatar images" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own avatar images" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Project members can access project files" ON storage.objects FOR ALL USING (
    bucket_id = 'files' 
    AND EXISTS (
        SELECT 1 FROM projects 
        WHERE projects.id::text = (storage.foldername(name))[1] 
        AND (projects.user_id = auth.uid() 
        OR EXISTS (
            SELECT 1 FROM project_clients 
            WHERE project_clients.project_id = projects.id AND project_clients.client_id = auth.uid()
        ))
    )
);

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
