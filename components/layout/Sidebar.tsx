"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  FolderKanban,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/projects", label: "Projekte", icon: FolderKanban },
  { href: "/settings", label: "Einstellungen", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r bg-gradient-to-b from-white to-[#F6F8F4] dark:from-[#121512] dark:to-[#1A1E19] text-foreground">
      {/* LOGO */}
      <div className="flex items-center gap-2 p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
                      <Image src="/logo.png" alt="FreelanceDesk Logo" width={240} height={64} priority />
                    </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} />
                {label}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        <Button
          variant="ghost"
          className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
        >
          <LogOut size={18} />
          Abmelden
        </Button>
      </div>
    </aside>
  );
}
