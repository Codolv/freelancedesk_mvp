# To-Dos Feature Documentation

## Overview
The To-Dos feature allows freelancers and clients to manage project tasks collaboratively. Freelancers can create, update, and delete tasks, while clients can view and mark tasks as completed.

## Database Setup

### 1. Run the Migration
Execute the SQL migration to create the `project_todos` table and set up Row Level Security:

```sql
-- Run the contents of supabase/migrations/create_project_todos.sql
```

### 2. Verify Table Structure
The `project_todos` table includes:
- `id`: UUID primary key
- `project_id`: Foreign key to projects table
- `title`: Task title (required)
- `description`: Optional task description
- `completed`: Boolean status (default: false)
- `due_date`: Optional due date
- `created_by`: Foreign key to profiles table
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Security Policies

### Row Level Security (RLS) Policies:
1. **Freelancers can insert todos**: Only project owners can create new tasks
2. **Freelancers can update todos**: Only project owners can edit task details
3. **Freelancers can delete todos**: Only project owners can delete tasks
4. **Freelancers and clients can select todos**: Both can view tasks
5. **Users can toggle todo completion**: Freelancers can update any field, clients can only mark as completed

## Frontend Components

### TodosTab Component
- **Location**: `app/(dashboard)/projects/[id]/components/TodosTab.tsx`
- **Features**:
  - Add new tasks with title, description, and due date
  - Inline editing of existing tasks
  - Mark tasks as complete/incomplete
  - Delete tasks (freelancer only)
  - Visual indicators for overdue tasks
  - Smooth animations with Framer Motion
  - Optimistic UI updates
  - Real-time synchronization via Supabase subscriptions

### Server Actions
- **Location**: `app/(dashboard)/projects/[id]/actions/todos.ts`
- **Actions**:
  - `addTodoAction`: Create new todo
  - `toggleTodoAction`: Mark todo as complete/incomplete
  - `updateTodoAction`: Update todo details
  - `deleteTodoAction`: Delete todo
  - `getTodos`: Fetch todos for a project

## UI Features

### Design Elements
- **Color Scheme**: Matches existing olive brand colors
- **Components**: Uses ShadCN UI components (Card, Input, Button, Checkbox, Calendar, etc.)
- **Animations**: Smooth transitions with Framer Motion
- **Responsive**: Works on desktop and mobile devices

### User Experience
- **Loading States**: Shows spinner while fetching data
- **Optimistic Updates**: UI updates immediately before server confirmation
- **Error Handling**: Graceful error handling with user feedback
- **Access Control**: Only shows relevant actions based on user role
- **Overdue Indicators**: Red borders and text for overdue tasks

## Integration

### Project Detail Page
The todos tab is integrated into the existing project detail view:
- Added to `ProjectTabsAnimated` component
- Fetches initial data server-side
- Maintains real-time synchronization

### Navigation
- New "Aufgaben" (Tasks) tab in project detail view
- Positioned after "Nachrichten" (Messages) tab
- Accessible to both freelancers and clients

## Usage

### For Freelancers:
1. Click "Neue Aufgabe" (New Task) to create a task
2. Fill in title, description (optional), and due date
3. Use edit/delete buttons to manage tasks
4. Mark tasks as complete/incomplete

### For Clients:
1. View all project tasks
2. Mark tasks as complete/incomplete
3. See task details, due dates, and creator information
4. Visual indicators for overdue tasks

## Technical Implementation

### State Management
- Uses React hooks for local state
- Supabase real-time subscriptions for sync
- Optimistic UI updates for better UX

### Performance
- Server-side data fetching for initial load
- Indexed database queries
- Efficient re-renders with React optimization

### Security
- Row Level Security policies in Supabase
- Server-side validation in Next.js actions
- Role-based access control

## Future Enhancements
- Task priorities
- Task categories/labels
- Task assignments to specific team members
- Task comments/notes
- Task attachments
- Email notifications for task updates
- Task templates
- Bulk operations
- Task filtering and sorting options
