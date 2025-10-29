import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Users, Mail, Folder } from "lucide-react";

export default async function ClientsPage() {
  const supabase = await getServerSupabaseComponent();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Bitte melde dich an.
      </div>
    );
  }

  // 1) Projekte des Freelancers
  const { data: ownedProjects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", user.id);

  const projectIds = (ownedProjects || []).map((p: any) => p.id);

  if (projectIds.length === 0) {
    return (
      <Motion
        className="max-w-3xl mx-auto py-10 text-center"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-4">Kunden</h1>
        <p className="text-muted-foreground mb-8">
          Du hast noch keine Projekte – dadurch sind auch keine Kunden vorhanden.
        </p>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-olive-600 text-white hover:bg-olive-700 transition"
        >
          Neues Projekt erstellen
        </Link>
      </Motion>
    );
  }

  // 2) project_clients für diese Projekte
  const { data: projectClients } = await supabase
    .from("project_clients")
    .select("client_id, project_id")
    .in("project_id", projectIds);

  const clientIds = [
    ...new Set((projectClients || []).map((r: any) => r.client_id)),
  ];

  // 3) Load profiles
  let profiles: { id: string; name: string; email: string; avatar_url: string | null }[] = [];
  if (clientIds.length) {
    const { data: _profiles } = await supabase
      .from("profiles")
      .select("id, name, email, avatar_url")
      .in("id", clientIds);
    profiles = _profiles || [];
  }

  // 4) Map projectId -> project
  const projectsById = (ownedProjects || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // 5) Group clients with their projects
  const clientsMap: Record<string, any> = {};
  (projectClients || []).forEach((r: any) => {
    const cid = r.client_id;
    if (!clientsMap[cid]) {
      const profile =
        profiles.find((p: any) => p.id === cid) || {
          id: cid,
          name: "Unbekannt",
          email: "—",
          avatar_url: null,
        };
      clientsMap[cid] = { profile, projects: [] };
    }
    if (projectsById[r.project_id]) {
      clientsMap[cid].projects.push(projectsById[r.project_id]);
    }
  });

  const clients = Object.values(clientsMap);

  // 6) Pending invites
  const { data: invites } = await supabase
    .from("project_invites")
    .select("email, accepted, project_id, projects(name)")
    .eq("accepted", false);

  return (
    <Motion
      className="max-w-5xl mx-auto py-10 space-y-10"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kunden</h1>
          <p className="text-muted-foreground mt-1">
            Alle deine Kunden aus Projekten und Einladungen im Überblick.
          </p>
        </div>
      </div>

      <Separator />

      {/* Active Clients */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" /> Aktive Kunden
        </h2>

        {clients.length === 0 ? (
          <div className="text-muted-foreground text-center py-16">
            Noch keine Kunden vorhanden.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((c: any, idx: number) => (
              <Motion
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-md border-border/60 bg-background/80 backdrop-blur-sm transition-all">
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <Avatar className="w-12 h-12">
                      {c.profile?.avatar_url ? (
                        <AvatarImage
                          src={
                            c.profile.avatar_url.startsWith("http")
                              ? c.profile.avatar_url
                              : `/api/avatar/${c.profile.avatar_url}`
                          }
                          alt={c.profile.name || "Avatar"}
                        />
                      ) : (
                        <AvatarFallback>
                          {c.profile?.name?.charAt(0) ?? "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-lg">
                        {c.profile?.name || "Unbekannt"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {c.profile?.email || ""}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <div className="flex flex-col gap-1">
                      <p className="font-medium text-foreground mb-1">
                        Projekte:
                      </p>
                      {c.projects.map((p: any) => (
                        <Link
                          key={p.id}
                          href={`/projects/${p.id}`}
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Folder className="h-4 w-4" /> {p.name}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Motion>
            ))}
          </div>
        )}
      </div>

      {/* Pending Invites */}
      {invites && invites.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-muted-foreground" /> Ausstehende
            Einladungen
          </h2>
          <div className="space-y-2">
            {invites.map((inv, idx) => (
              <Motion
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border rounded-md p-4 bg-card flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Eingeladen zu {inv.projects?.name}
                  </p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      )}
    </Motion>
  );
}
