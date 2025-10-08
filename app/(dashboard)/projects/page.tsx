import { getServerSupabaseComponent } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import { PlusCircle } from "lucide-react";

export default async function ProjectsPage() {
  const supabase = await getServerSupabaseComponent();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let projects:
    | Array<{
        id: string;
        name: string;
        description: string | null;
        deadline: string | null;
      }>
    | [] = [];

  if (user) {
    const { data } = await supabase
      .from("projects")
      .select("id, name, description, deadline")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    projects = (data as any) || [];
  }

  return (
    <Motion
      className="space-y-8 max-w-5xl mx-auto py-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekte</h1>
          <p className="text-muted-foreground mt-1">
            Verwalte alle Kundenprojekte an einem Ort.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Neues Projekt
          </Link>
        </Button>
      </div>

      {/* Projects List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && (
          <Motion
            className="col-span-full text-center py-20 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-medium mb-2">
              Noch keine Projekte vorhanden.
            </p>
            <p className="text-sm mb-4">
              Erstelle dein erstes Projekt, um loszulegen.
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Projekt hinzufügen
              </Link>
            </Button>
          </Motion>
        )}

        {projects.map((p, idx) => (
          <Motion
            key={p.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={`/projects/${p.id}`}>
              <Card className="hover:shadow-md hover:-translate-y-1 transition-all duration-200 border-border/60 bg-background/80 backdrop-blur-sm h-full">
                <CardHeader>
                  <h3 className="font-semibold text-lg truncate">{p.name}</h3>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {p.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  {p.deadline && (
                    <div className="text-xs text-muted-foreground">
                      Frist:{" "}
                      {new Date(p.deadline).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          </Motion>
        ))}
      </div>
    </Motion>
  );
}
