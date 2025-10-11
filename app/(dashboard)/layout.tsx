import { Sidebar } from "@/components/layout/Sidebar";
import { getServerSupabaseComponent } from "@/lib/supabase/server";
import "../globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await getServerSupabaseComponent();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="de">
      <body className="flex bg-background text-foreground min-h-screen">
        {/* Sidebar */}
        <Sidebar
          user={{
            name: user?.user_metadata?.full_name || "Freelancer",
            email: user?.email,
            avatar_url: user?.user_metadata?.avatar_url || "",
          }}
        />

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto px-8 py-6"
            style={{
              minWidth: 0, // Prevent motion from breaking flex layout
            }}>
          {children}
        </main>
      </body>
    </html>
  );
}
