"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getBrowserSupabase } from "@/lib/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projekte", href: "/projects", icon: FolderKanban },
  { name: "Rechnungen", href: "/invoices", icon: FileText },
  { name: "Kunden", href: "/clients", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ✅ Fetch user and avatar
  useEffect(() => {
    const fetchUser = async () => {
      const supabase = getBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get profile info
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      setUser({
        name: profile?.name || "Unbekannter Nutzer",
        email: user.email,
      });

      if (profile?.avatar_url) {
        // ✅ Convert avatar path to public URL
        const { data } = await supabase.storage
          .from("avatars")
          .createSignedUrl(profile.avatar_url, 60 * 60);
        setAvatarUrl(data?.signedUrl || null);
      }
    };

    fetchUser();
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 240 }}
      className={cn(
        "h-screen fixed left-0 top-0 z-40 flex flex-col border-r border-border/40 bg-background/80 backdrop-blur-sm transition-all duration-300 shadow-sm"
      )}
    >
      {/* === Logo + Collapse Button === */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="FreelanceDesk Logo"
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="font-semibold text-lg">FreelanceDesk</span>
          </div>
        ) : (
          <Image
            src="/logo.png"
            alt="Logo"
            width={28}
            height={28}
            className="rounded-sm mx-auto"
          />
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>
      </div>

      {/* === Navigation === */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200",
                  active
                    ? "bg-muted/60 text-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted/40"
                )}
              >
                <Icon size={18} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* === Quick Action Button === */}
      <div className="p-4 border-t border-border/30">
        <Button
          asChild
          className="w-full justify-center"
          size={collapsed ? "icon" : "default"}
        >
          <Link href="/projects/new">
            <PlusCircle size={18} className={collapsed ? "" : "mr-2"} />
            {!collapsed && "Neues Projekt"}
          </Link>
        </Button>
      </div>

      {/* === User Section === */}
      <div className="p-4 border-t border-border/30 flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 w-full hover:bg-muted/30 rounded-md p-2 transition">
              {avatarUrl ? (
                <motion.img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                    />
              ) : (
                <div className="w-9 h-9 rounded-full bg-muted border border-border/30" />
              )}

              {!collapsed && (
                <div className="flex-1 text-left truncate">
                  <p className="text-sm font-medium">
                    {user?.name || "Lädt..."}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="top" align="start" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <User size={16} className="mr-2" /> Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings/billing">
                <CreditCard size={16} className="mr-2" /> Abrechnung
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help">
                <HelpCircle size={16} className="mr-2" /> Hilfe & Support
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                const supabase = getBrowserSupabase();
                await supabase.auth.signOut();
                window.location.href = "/";
              }}
            >
              <LogOut size={16} className="mr-2 text-destructive" /> Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.aside>
  );
}
