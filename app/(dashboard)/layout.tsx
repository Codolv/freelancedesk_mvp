import Sidebar from "@/components/layout/Sidebar";
import "../globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="h-screen flex bg-background text-foreground">
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-border bg-muted/10 z-50">
        <Sidebar />
      </aside>

      <main className="w-full px-4 flex-1 ml-64 overflow-y-visible">
        <div className="min-h-full p-6">{children}</div>
      </main>

      
    </div>

  );
}
