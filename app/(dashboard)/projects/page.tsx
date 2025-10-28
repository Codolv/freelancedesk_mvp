import { getServerSupabaseComponent } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Motion } from "@/components/custom/Motion";
import { PlusCircle, Folder, UserPlus2, ArrowRight } from "lucide-react";

export default async function ProjectsPage() {
  const supabase = await getServerSupabaseComponent();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Bitte melde dich an, um deine Projekte zu sehen.
      </div>
    );
  }

  // === Fetch owned projects ===
  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name, description, deadline")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // === Fetch invited projects ===
  const { data: invitedProjects } = await supabase
    .from("project_clients")
    .select("project_id, projects(id, name, description, deadline)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  const invitedList =
    invitedProjects?.map((p) => p.projects).filter(Boolean) || [];

  return (
    <Motion
      className="space-y-10 max-w-5xl mx-auto py-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projekte</h1>
          <p className="text-muted-foreground mt-1">
            Hier findest du alle Projekte, die du besitzt oder zu denen du eingeladen wurdest.
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Neues Projekt
          </Link>
        </Button>
      </div>

      {/* === Owned Projects Section === */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
          <Folder className="h-5 w-5 text-[hsl(85,30%,35%)]" />
          Eigene Projekte
        </h2>
        <Separator className="mb-4" />

        {(!ownedProjects || ownedProjects.length === 0) && (
          <p className="text-muted-foreground">Du hast noch keine Projekte erstellt.</p>
        )}

        <ul className="divide-y divide-border/50 rounded-lg border border-border/50 bg-background/70 backdrop-blur-sm">
          {ownedProjects?.map((p, i) => (
            <Motion
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-muted/40 transition-all duration-200 group"
            >
              <Link href={`/projects/${p.id}`} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-lg group-hover:text-[hsl(85,30%,35%)] transition-colors">
                    {p.name}
                  </p>
                  {p.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {p.description}
                    </p>
                  )}
                  {p.deadline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Frist:{" "}
                      {new Date(p.deadline).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(85,30%,35%)] transition" />
              </Link>
            </Motion>
          ))}
        </ul>
      </section>

      {/* === Invited Projects Section === */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
          <UserPlus2 className="h-5 w-5 text-[hsl(85,30%,35%)]" />
          Eingeladene Projekte
        </h2>
        <Separator className="mb-4" />

        {invitedList.length === 0 && (
          <p className="text-muted-foreground">
            Du wurdest noch zu keinem Projekt eingeladen.
          </p>
        )}

        <ul className="divide-y divide-border/50 rounded-lg border border-border/50 bg-background/70 backdrop-blur-sm">
          {invitedList.map((p: any, i: number) => (
            <Motion
              key={p?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-muted/40 transition-all duration-200 group"
            >
              <Link href={`/projects/${p?.id}`} className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-lg group-hover:text-[hsl(85,30%,35%)] transition-colors">
                    {p?.name}
                  </p>
                  {p?.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {p.description}
                    </p>
                  )}
                  {p?.deadline && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Frist:{" "}
                      {new Date(p.deadline).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[hsl(85,30%,35%)] transition" />
              </Link>
            </Motion>
          ))}
        </ul>
      </section>
    </Motion>
  );
}
