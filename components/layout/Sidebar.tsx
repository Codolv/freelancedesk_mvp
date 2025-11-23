"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useMediaQuery } from "react-responsive";
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
  Menu,
  X,
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
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useT } from "@/lib/i18n/client";

const navItems = [
  { key: "sidebar.dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "sidebar.projects", href: "/projects", icon: FolderKanban },
  { key: "sidebar.invoices", href: "/invoices", icon: FileText },
  { key: "sidebar.clients", href: "/clients", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useT();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });

  interface UserData {
    name: string;
    email: string;
  }

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Handle mobile close when navigating
  useEffect(() => {
    if (isMobile) {
      setMobileOpen(false);
    }
  }, [pathname, isMobile]);

  // Close mobile menu when collapsing sidebar on mobile
  useEffect(() => {
    if (isMobile && collapsed) {
      setMobileOpen(false);
    }
  }, [collapsed, isMobile]);

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
        name: profile?.name || t("dashboard.settings"), // Changed to translation key
        email: user?.email || t("dashboard.settings"), // Changed to translation key
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
  }, [t]);

  // Calculate width based on screen size
  const getWidth = () => {
    if (isMobile) return mobileOpen ? "80%" : "0px";
    if (isTablet) return collapsed ? 80 : 220;
    return collapsed ? 80 : 280;
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button (only shows on mobile) */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="bg-background border-border"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </Button>
        </div>
      )}

      <motion.aside
        animate={{ width: getWidth() }}
        className={cn(
          "h-screen fixed left-0 top-0 z-50 flex flex-col border-r border-border/40 bg-background shadow-sm transition-all duration-300",
          isMobile ? "lg:static lg:h-full lg:relative" : "max-w-[280px] min-w-[80px]"
        )}
        style={{ width: getWidth() }}
      >
        {/* === Logo + Collapse Button === */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 flex-shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {!collapsed && !isMobile ? (
              <>
                <Image
                  src="/logo.png"
                  alt="FreelanceDesk Logo"
                  width={28}
                  height={28}
                  className="rounded-sm flex-shrink-0"
                />
                <span className="font-semibold text-lg truncate">FreelanceDesk</span>
              </>
            ) : isMobile ? (
              <>
                <Image
                  src="/logo.png"
                  alt="FreelanceDesk Logo"
                  width={28}
                  height={28}
                  className="rounded-sm flex-shrink-0"
                />
                <span className="font-semibold text-lg truncate">FreelanceDesk</span>
              </>
            ) : (
              <Image
                src="/logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="rounded-sm mx-auto flex-shrink-0"
              />
            )}
          </div>

          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
          )}

          {isMobile && mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-muted-foreground hover:text-foreground flex-shrink-0 lg:hidden"
            >
              <X size={18} />
            </Button>
          )}
        </div>

        {/* Main content container */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* === Navigation === */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1 flex-shrink-0">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href} className="block" onClick={isMobile ? () => setMobileOpen(false) : undefined}>
                  <motion.div
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 cursor-pointer",
                      "min-h-[44px]",
                      active
                        ? "bg-muted/60 text-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/40 hover:pl-6 transition-all duration-200"
                    )}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <AnimatePresence>
                      {!collapsed && !isMobile && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="truncate"
                        >
                          {t(item.key)}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {/* Show labels on mobile even when "collapsed" */}
                    {isMobile && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="truncate"
                      >
                        {t(item.key)}
                      </motion.span>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* === Bottom Section === */}
          <div className="mt-auto space-y-2 flex-shrink-0 border-t border-border/30 w-full overflow-hidden">
            {/* === Quick Action Button === */}
            <div className={`p-4 w-full overflow-hidden ${isMobile && !mobileOpen ? 'hidden' : ''}`}>
              <Button
                asChild
                className="w-full justify-center overflow-hidden"
                size={collapsed && !isMobile ? "icon" : "default"}
              >
                <Link href="/projects/new" className="w-full overflow-hidden" onClick={isMobile ? () => setMobileOpen(false) : undefined}>
                  <PlusCircle size={18} className={(collapsed && !isMobile) || isMobile ? "" : "mr-2 flex-shrink-0"} />
                  {!(collapsed && !isMobile) && !isMobile && <span className="truncate">{t("sidebar.new.project")}</span>}
                  {isMobile && <span className="truncate">{t("sidebar.new.project")}</span>}
                </Link>
              </Button>
            </div>

            {/* === User Section === */}
            <div className={`p-4 w-full ${isMobile && !mobileOpen ? 'hidden' : ''}`}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 w-full hover:bg-muted/30 rounded-md p-2 transition min-w-0 overflow-hidden">
                    {avatarUrl ? (
                      <motion.img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full object-cover border flex-shrink-0"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                          />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted border border-border/30 flex-shrink-0" />
                    )}

                    {!collapsed && !isMobile && (
                      <div className="flex-1 text-left min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {user?.name || t("dashboard.settings")} {/* Changed to translation key */}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    )}
                    {/* Show user info on mobile */}
                    {isMobile && (
                      <div className="flex-1 text-left min-w-0 overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {user?.name || t("dashboard.settings")}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email || ""}
                        </p>
                      </div>
                    )}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="right" align="end" className="w-48 ml-1 lg:hidden">
                  <DropdownMenuItem asChild>
                    <Link href="/settings">
                      <User size={16} className="mr-2" /> {t("sidebar.profile")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings/billing">
                      <CreditCard size={16} className="mr-2" /> {t("sidebar.billing")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/help">
                      <HelpCircle size={16} className="mr-2" /> {t("sidebar.help")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      const supabase = getBrowserSupabase();
                      await supabase.auth.signOut();
                      window.location.href = "/";
                    }}
                  >
                    <LogOut size={16} className="mr-2 text-destructive" /> {t("sidebar.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

      </motion.aside>
    </>
  );
}
