"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projekte", href: "/projects", icon: FolderKanban },
  { name: "Einstellungen", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed left-0 top-0 h-screen w-64 border-r bg-white shadow-sm flex flex-col"
    >
      {/* Logo */}
      <div className="flex items-center justify-center space-x-2 py-6 border-b">
        <Link href="/"><Image src="/logo.png" alt="FreelanceDesk Logo" width={140} height={36} priority /></Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-4 space-y-2">
        {navItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors",
                  isActive && "bg-blue-100 text-blue-700 font-medium"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* Footer (optional) */}
      <div className="p-4 border-t text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} FreelanceDesk
      </div>
    </motion.aside>
  );
}
