import { getServerSupabaseAction, getServerSupabaseComponent } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { Motion } from "@/components/custom/Motion";

const schema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().default(""),
  deadline: z.string().optional(),
});

async function updateProject(projectId: string, formData: FormData) {
  "use server";
  const supabase = await getServerSupabaseAction();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const raw = {
    name: formData.get("name")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    deadline: formData.get("deadline")?.toString() || "",
  };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return;

  await supabase
    .from("projects")
    .update({
      name: parsed.data.name,
      description: parsed.data.description,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline).toISOString() : null,
    })
    .eq("id", projectId)
    .eq("user_id", user.id);

  redirect(`/projects/${projectId}`);
}

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const supabase = await getServerSupabaseComponent();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, description, deadline, user_id")
    .eq("id", params.id)
    .single();

  if (!project) {
    return <div className="text-center text-muted-foreground py-20">Projekt nicht gefunden.</div>;
  }

  return (
    <Motion
      className="max-w-2xl mx-auto py-10 space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className="text-3xl font-bold tracking-tight mb-1">Projekt bearbeiten</h1>
      <p className="text-muted-foreground mb-6">
        Aktualisiere die Projektdetails. Änderungen werden sofort übernommen.
      </p>

      <Card className="border-border/60 bg-background/80 backdrop-blur-sm shadow-sm">
        <CardHeader>
          <CardTitle>Projektdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateProject.bind(null, params.id)} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Projektname</Label>
              <Input id="name" name="name" defaultValue={project.name} required />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                defaultValue={project.description ?? ""}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="deadline">Frist</Label>
              <div className="relative">
                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  className="pl-8"
                  defaultValue={
                    project.deadline
                      ? new Date(project.deadline).toISOString().split("T")[0]
                      : ""
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" asChild>
                <a href={`/projects/${params.id}`}>Abbrechen</a>
              </Button>
              <Button type="submit">Änderungen speichern</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Motion>
  );
}
