export const dynamic = "force-dynamic";

import { getServerSupabaseComponent } from "@/lib/supabase/server";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Mail, Folder } from "lucide-react";

export default async function ClientsPage() {
  try {
    const supabase = await getServerSupabaseComponent();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Auth error:", userError);
      return (
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          <Card className="max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold text-destructive">Authentication Error</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Unable to authenticate. Please try signing in again.
              </p>
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!user) {
      return (
        <div className="flex items-center justify-center h-screen text-muted-foreground">
          <Card className="max-w-md">
            <CardHeader>
              <h2 className="text-lg font-semibold">Authentication Required</h2>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to view your clients.
              </p>
              <Button asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    // 1) Projekte des Freelancers
    const { data: ownedProjects, error: projectsError } = await supabase
      .from("projects")
      .select("id, name")
      .eq("user_id", user.id);

    if (projectsError) {
      console.error("Projects fetch error:", projectsError);
      return (
        <Motion
          className="w-full max-w-6xl mx-auto py-10 text-center px-4"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold tracking-tight mb-4">Error Loading Projects</h1>
          <p className="text-muted-foreground mb-4">
            We encountered an error while loading your projects. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} variant="default">
            Retry
          </Button>
        </Motion>
      );
    }

  const projectIds = (ownedProjects || []).map((p: { id: string }) => p.id);

  if (projectIds.length === 0) {
    return (
      <Motion
        className="w-full max-w-6xl mx-auto py-10 text-center px-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-4">Kunden</h1>
        <p className="text-muted-foreground mb-8">
          Du hast noch keine Projekte – dadurch sind auch keine Kunden vorhanden.
        </p>
        <Button asChild>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-2"
          >
            Neues Projekt erstellen
          </Link>
        </Button>
      </Motion>
    );
  }

  // 2) project_clients für diese Projekte
  const { data: projectClients } = await supabase
    .from("project_clients")
    .select("client_id, project_id")
    .in("project_id", projectIds);

  const clientIds = [
    ...new Set((projectClients || []).map((r: { client_id: string }) => r.client_id)),
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
  const projectsById = (ownedProjects || []).reduce((acc: Record<string, { id: string; name: string }>, p: { id: string; name: string }) => {
    acc[p.id] = p;
    return acc;
  }, {} as Record<string, { id: string; name: string }>);

  // 5) Group clients with their projects
  interface ClientData {
    profile: {
      id: string;
      name: string;
      email: string;
      avatar_url: string | null;
    };
    projects: Array<{ id: string; name: string }>;
  }

  const clientsMap: Record<string, ClientData> = {};
  (projectClients || []).forEach((r: { client_id: string; project_id: string }) => {
    const cid = r.client_id;
    if (!clientsMap[cid]) {
      const profile =
        profiles.find((p: { id: string; name: string; email: string; avatar_url: string | null }) => p.id === cid) || {
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
  interface InviteData {
    email: string;
    accepted: boolean;
    project_id: string;
    projects: Array<{ name: string }> | null;
  }

  const { data: invites } = await supabase
    .from("project_invites")
    .select("email, accepted, project_id, projects(name)")
    .eq("accepted", false);

  return (
    <Motion
      className="w-full max-w-7xl mx-auto py-10 space-y-10 px-4"
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
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {clients.map((c: ClientData, idx: number) => (
          <Motion
            key={c.profile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="h-auto"
          >
            <Card className="hover:shadow-lg border-border/60 bg-background/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
              <CardHeader className="flex flex-row items-center gap-3 pb-3">
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-lg truncate">
                    {c.profile?.name || "Unbekannt"}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {c.profile?.email || ""}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2 flex-1">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-foreground mb-1">
                    Projekte:
                  </p>
                  {c.projects.map((p: { id: string; name: string }) => (
                    <Link
                      key={p.id}
                      href={`/projects/${p.id}`}
                      className="flex items-center gap-2 text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      <Folder className="h-4 w-4 flex-shrink-0" /> 
                      <span className="truncate">{p.name}</span>
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
            {invites?.map((inv: InviteData, idx: number) => (
              <Motion
                key={`${inv.email}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.3 }}
                className="border rounded-lg p-4 bg-card/50 hover:bg-card/80 transition-colors"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    Eingeladen zu {Array.isArray(inv.projects) && inv.projects.length > 0 
                      ? inv.projects[0]?.name || "Unknown Project"
                      : "Unknown Project"}
                  </p>
                </div>
              </Motion>
            ))}
          </div>
        </div>
      )}
    </Motion>
  );
  } catch (error) {
    console.error("Unexpected error in ClientsPage:", error);
    return (
      <Motion
        className="w-full max-w-6xl mx-auto py-10 text-center px-4"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-4">Unexpected Error</h1>
        <p className="text-muted-foreground mb-4">
          We encountered an unexpected error while loading your clients. Please try again.
        </p>
        <Button onClick={() => window.location.reload()} variant="default">
          Retry
        </Button>
      </Motion>
    );
  }
}
