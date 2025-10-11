import { getServerSupabaseComponent } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Motion } from "@/components/custom/Motion";
import { PlusCircle, Calendar, ChevronRight } from "lucide-react";

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
      className="space-y-10 max-w-5xl mx-auto py-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekte</h1>
          <p className="text-muted-foreground mt-1">
            Eine Übersicht über alle Kundenprojekte.
          </p>
        </div>
        <Button asChild className="bg-[--color-accent] hover:bg-[--color-accent-hover] text-white">
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Neues Projekt
          </Link>
        </Button>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <Motion
          className="text-center py-20 text-muted-foreground"
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
          <Button variant="default" asChild>
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Projekt hinzufügen
            </Link>
          </Button>
        </Motion>
      ) : (
        <div className="rounded-lg border border-border/40 bg-background/50 backdrop-blur-sm divide-y divide-border/40">
          {projects.map((p, idx) => (
            <Motion
              className=""
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link
                href={`/projects/${p.id}`}
                className="group flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate group-hover:text-[--color-accent] transition-colors">
                      {p.name}
                    </p>
                    {p.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {p.description}
                      </p>
                    )}
                  </div>
                  {p.deadline && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
                      <Calendar className="h-4 w-4 opacity-70" />
                      {new Date(p.deadline).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 ml-4 text-muted-foreground group-hover:text-[--color-accent]" />
              </Link>
            </Motion>
          ))}
        </div>
      )}
    </Motion>
  );
}
