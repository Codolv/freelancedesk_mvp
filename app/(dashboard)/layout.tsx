import { Sidebar } from "@/components/layout/Sidebar";
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import "../globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabaseComponent();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Bitte anmelden.</div>;

  return (
    <div className="h-screen flex bg-background text-foreground">
      <aside 
        className="fixed left-0 top-0 h-full w-64 border-r border-border bg-muted/10 z-50 transition-all duration-300"
        id="sidebar"
      >
        <Sidebar user={user} />
      </aside>

      <main 
        className="w-full max-w-none px-4 flex-1 ml-64 overflow-y-visible transition-all duration-300"
        id="main-content"
      >
        <div className="min-h-full p-6">{children}</div>
      </main>
    </div>
  );
}
