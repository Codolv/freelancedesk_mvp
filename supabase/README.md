# Supabase Database Schema

This directory contains the database schema definition for the Freelancedesk MVP project.

## Schema Overview

The database schema includes the following tables:

### Core Tables
- `profiles` - User profiles linked to Supabase auth users
- `projects` - Main project records
- `project_clients` - Many-to-many relationship between projects and clients
- `project_invites` - Project invitation management
- `project_todos` - Task management for projects
- `project_invoices` - Invoice management for projects
- `project_invoice_items` - Line items for invoices
- `project_messages` - Project communication

### Storage Buckets
- `avatars` - Public user avatar storage
- `files` - Private project file storage

## Applying the Schema

To apply this schema to an empty PostgreSQL database with Supabase:

### Method 1: Using Supabase CLI
```bash
# Initialize Supabase project (if not already done)
supabase init

# Start local development
supabase start

# Apply the schema
supabase db reset
```

### Method 2: Manual Application
```bash
# Connect to your PostgreSQL database and run:
psql -d your_database_name -f supabase/schema.sql
```

### Method 3: Using Supabase Dashboard
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `schema.sql`
4. Execute the query

## Key Features

- **Row Level Security (RLS)**: All tables have RLS enabled with appropriate policies
- **UUID Primary Keys**: Uses UUIDs for all primary keys
- **Indexes**: Proper indexing for performance
- **Foreign Key Constraints**: Maintains data integrity
- **Storage Integration**: Configured for Supabase storage with proper policies

## Authentication Integration

The schema integrates with Supabase Auth:
- `profiles` table references `auth.users`
- RLS policies use `auth.uid()` for access control
- Profile data is linked to authentication users

## Storage Policies

- Avatar images are publicly accessible
- Project files are accessible only to project members (owners and clients)
- File access respects project membership relationships
