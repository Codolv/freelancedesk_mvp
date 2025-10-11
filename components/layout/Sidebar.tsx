"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getProfile } from "@/lib/supabase/profile";

export function Sidebar({ user }: { user?: { email?: string; name?: string; avatar_url?: string } }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>({
    avatar_url: "",
    email: "",
    phone: "",
    linkedin: "",
    twitter: "",
    website: "",
  });

  useEffect(() => {
    getProfile().then(setProfile).catch(() => { });
  }, []);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/projects", label: "Projekte", icon: FolderKanban },
    { href: "/settings", label: "Einstellungen", icon: Settings },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <motion.aside
        initial={{ width: 260 }}
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="h-screen bg-primary text-primary-foreground flex flex-col border-r border-border shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-semibold tracking-tight"
            >
              FreelanceDesk
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((p) => !p)}
            className="text-primary-foreground hover:bg-primary/40"
          >
            {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150",
                      active
                        ? "bg-primary-foreground/10 text-white font-medium"
                        : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        {label}
                      </motion.span>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && <TooltipContent side="right">{label}</TooltipContent>}
              </Tooltip>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-primary-foreground/20 px-4 py-3 flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile.singedAvatarUrl || ""} alt={user?.name || "User"} />
            <AvatarFallback>
              {profile.name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-medium truncate">{profile.name || "Unbekannt"}</p>
                <p className="text-xs opacity-75 truncate">{profile.email || "Kein E-Mail"}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
