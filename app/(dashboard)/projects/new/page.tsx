import { getServerSupabaseAction } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import NewProjectForm from "@/components/projects/NewProjectForm";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  deadline: z.string().optional(),
});

// ✅ Server Action
export async function createProject(formData: FormData) {
  "use server";
  const supabase = await getServerSupabaseAction();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const raw = {
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    deadline: formData.get("deadline")?.toString() || "",
  };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return;

  const payload = {
    name: parsed.data.name,
    description: parsed.data.description,
    deadline: parsed.data.deadline
      ? new Date(parsed.data.deadline).toISOString()
      : null,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from("projects")
    .insert(payload)
    .select("id")
    .single();

  if (!error && data?.id) redirect(`/projects/${data.id}`);
}

export default async function NewProjectPage() {
  return <NewProjectForm createAction={createProject} />;
}
