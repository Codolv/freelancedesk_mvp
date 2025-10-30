import Sidebar from "@/components/layout/Sidebar";
import "../globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex bg-background text-foreground">
      <Sidebar />
      <main className="w-full px-4 flex-1 overflow-y-visible ml-[240px]">
        <div className="min-h-full p-6">{children}</div>
      </main>
    </div>
  );
}
