import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/layout/Footer";
import "../globals.css";
import { Toaster } from "sonner";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex flex-1">
        <Sidebar />
        <main className="w-full px-6 flex-1 overflow-y-visible lg:ml-[280px] md:ml-[220px] ml-0 transition-all duration-300">
          <div className="min-h-[calc(100vh-120px)] p-4 flex flex-col">
            {/* Top right controls */}
            <div className="flex items-center justify-end gap-2 mb-4">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            {children}
          </div>
        </main>
      </div>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}
