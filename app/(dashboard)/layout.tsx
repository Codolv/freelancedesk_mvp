import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import "../globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex flex-1">
        <Sidebar />
        <main className="w-full px-6 flex-1 overflow-y-visible ml-[280px]">
          <div className="min-h-[calc(100vh-120px)] p-8 flex flex-col">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
