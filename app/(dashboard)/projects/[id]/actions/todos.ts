"use server";

import { getServerSupabaseAction } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTodoAction(projectId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Check if user is the project owner (freelancer)
  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  if (!project || project.user_id !== user.id) {
    throw new Error("Only project owners can create todos");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

  const { data, error } = await supabase.from("project_todos").insert({
    project_id: projectId,
    title: title.trim(),
    description: description?.trim() || null,
    due_date: dueDate || null,
    completed: false,
    created_by: user.id,
  }).select().single();

  if (error) throw error;

  revalidatePath(`/projects/${projectId}`);
  return data;
}

export async function toggleTodoAction(todoId: string, completed: boolean) {
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // First, get the basic todo information
  const { data: todo, error: todoError } = await supabase
    .from("project_todos")
    .select("id, project_id")
    .eq("id", todoId)
    .single();

  if (todoError || !todo) {
    console.error("Error fetching todo:", todoError);
    throw new Error("Todo not found");
  }

  // Check if user has access to this project (project owner or client)
  const { data: projectData, error: accessError } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", todo.project_id)
    .single();

  if (accessError || !projectData) {
    console.error("Error checking project access:", accessError);
    throw new Error("Project not found");
  }

  // Check if user is project owner
  const isProjectOwner = projectData.user_id === user.id;

  // Check if user is a client of this project
  const { data: clientData } = await supabase
    .from("project_clients")
    .select("id")
    .eq("project_id", todo.project_id)
    .eq("client_id", user.id)
    .maybeSingle();

  const isClient = !!clientData;

  if (!isProjectOwner && !isClient) {
    throw new Error("You don't have access to this todo");
  }

  const { error: updateError } = await supabase
    .from("project_todos")
    .update({ completed })
    .eq("id", todoId);

  if (updateError) throw updateError;

  revalidatePath(`/projects/${todo.project_id}`);
}

export async function updateTodoAction(todoId: string, formData: FormData) {
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Check if user is the project owner (freelancer)
  const { data: todo } = await supabase
    .from("project_todos")
    .select(`
      id,
      project_id,
      projects!inner (
        user_id
      )
    `)
    .eq("id", todoId)
    .single<{ id: string; project_id: string; projects: { user_id: string } }>();


  if (!todo || todo.projects.user_id !== user.id) {
    throw new Error("Only project owners can update todos");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDate = formData.get("due_date") as string;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

  const { error } = await supabase
    .from("project_todos")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      due_date: dueDate || null,
    })
    .eq("id", todoId);

  if (error) throw error;

  revalidatePath(`/projects/${todo.project_id}`);
}

export async function deleteTodoAction(todoId: string) {
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  // Check if user is the project owner (freelancer)
  const { data: todo } = await supabase
    .from("project_todos")
    .select(`
      id,
      project_id,
      projects!inner (
        user_id
      )
    `)
    .eq("id", todoId)
    .single<{ id: string; project_id: string; projects: { user_id: string } }>();

  if (!todo || todo.projects.user_id !== user.id) {
    throw new Error("Only project owners can delete todos");
  }

  const { error } = await supabase.from("project_todos").delete().eq("id", todoId);

  if (error) throw error;

  revalidatePath(`/projects/${todo.project_id}`);
}

export async function getTodos(projectId: string) {
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Check if user has access to this project (owner or client)
  const { data: project } = await supabase
    .from("projects")
    .select("user_id")
    .eq("id", projectId)
    .single();

  const { data: isClient } = await supabase
    .from("project_clients")
    .select("id")
    .eq("project_id", projectId)
    .eq("client_id", user.id)
    .maybeSingle();

  if (!project || (project.user_id !== user.id && !isClient)) {
    return [];
  }

  const { data: todos } = await supabase
    .from("project_todos")
    .select(`
      *,
      profiles (
        id,
        name,
        email,
        avatar_url
      )
    `)
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return todos || [];
}
