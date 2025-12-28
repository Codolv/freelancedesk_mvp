"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Folder,
  Wallet,
  User,
  CheckSquare,
  Flag
} from "lucide-react";
import { Comments } from "./components/Comments";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";
import { TodosTab } from "./components/TodosTab";
import { MilestonesTab } from "./components/MilestonesTab";
import { useT } from "@/lib/i18n/client";

// All your interfaces stay the same…

export default function ProjectTabsAnimated({
  projectId,
  isFreelancer,
  isClient,
  messages,
  files,
  invoices,
  acceptedClients,
  pendingInvites,
  user,
  todos,
  milestones
}: ProjectTabsAnimatedProps) {
  const { t } = useT();

  const [value, setValue] = useState<string>("messages");
  const [height, setHeight] = useState<number | "auto">("auto");

  // ---- Bottom nav auto-hide state ----
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;

      if (current > lastScrollY.current + 10) {
        setShowNav(false); // scrolling down → hide
      } else if (current < lastScrollY.current - 10) {
        setShowNav(true); // scrolling up → show
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---- Height measurement logic stays unchanged ----
  const refs = {
    messages: useRef<HTMLDivElement>(null),
    todos: useRef<HTMLDivElement>(null),
    milestones: useRef<HTMLDivElement>(null),
    files: useRef<HTMLDivElement>(null),
    invoices: useRef<HTMLDivElement>(null),
    clients: useRef<HTMLDivElement>(null)
  };

  const measure = useCallback((key: keyof typeof refs) => {
    const el = refs[key]?.current;
    if (!el) return setHeight("auto");
    const rect = el.getBoundingClientRect();
    setHeight(Math.ceil(rect.height));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => measure(value as keyof typeof refs), 40);
    return () => clearTimeout(t);
  }, [value, measure]);

  useEffect(() => {
    const el = refs[value as keyof typeof refs]?.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measure(value as keyof typeof refs);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, measure]);

  const containerStyle: React.CSSProperties =
    height === "auto"
      ? { height: "auto", transition: "height 220ms ease" }
      : { height: height + "px", transition: "height 220ms ease" };

  return (
    <>
      {/* DESKTOP TABS */}
      <Tabs
        value={value}
        onValueChange={setValue}
        className="w-full hidden sm:block"
      >
        <TabsList className="mb-4 flex flex-wrap gap-1 w-full items-center">
          <TabsTrigger value="messages">
            <MessageSquare className="w-4 h-4" />
            {t("dashboard.messages")}
          </TabsTrigger>

          <TabsTrigger value="todos">
            <CheckSquare className="w-4 h-4" />
            {t("dashboard.todos")}
          </TabsTrigger>

          <TabsTrigger value="milestones">
            <Flag className="w-4 h-4" />
            {t("dashboard.milestones")}
          </TabsTrigger>

          <TabsTrigger value="files">
            <Folder className="w-4 h-4" />
            {t("dashboard.files")}
          </TabsTrigger>

          <TabsTrigger value="invoices">
            <Wallet className="w-4 h-4" />
            {t("dashboard.invoices")}
          </TabsTrigger>

          {isFreelancer && (
            <TabsTrigger value="clients">
              <User className="w-4 h-4" />
              {t("dashboard.clients")}
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* ANIMATED CONTENT */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        style={containerStyle}
        className="w-full overflow-hidden pb-28 sm:pb-0"
      >
        <div className="w-full">
          {/* Messages */}
          <div ref={refs.messages} style={{ display: value === "messages" ? "block" : "none" }}>
            <Comments projectId={projectId} messages={messages} />
          </div>

          {/* Todos */}
          <div ref={refs.todos} style={{ display: value === "todos" ? "block" : "none" }}>
            <TodosTab projectId={projectId} isFreelancer={isFreelancer} initialTodos={todos} />
          </div>

          {/* Milestones */}
          <div ref={refs.milestones} style={{ display: value === "milestones" ? "block" : "none" }}>
            <MilestonesTab projectId={projectId} isFreelancer={isFreelancer} initialMilestones={milestones} />
          </div>

          {/* Files */}
          <div ref={refs.files} style={{ display: value === "files" ? "block" : "none" }}>
            <FilesTab files={files} projectId={projectId} canUpload={isFreelancer} />
          </div>

          {/* Invoices */}
          <div ref={refs.invoices} style={{ display: value === "invoices" ? "block" : "none" }}>
            <InvoicesTab invoices={invoices} projectId={projectId} isFreelancer={isFreelancer} canManage={isFreelancer} />
          </div>

          {/* Clients */}
          {isFreelancer && (
            <div ref={refs.clients} style={{ display: value === "clients" ? "block" : "none" }}>
              <ClientsTab projectId={projectId} clients={acceptedClients} invites={pendingInvites} />
            </div>
          )}
        </div>
      </motion.div>

      {/* MOBILE BOTTOM NAVIGATION (with auto-hide + haptics) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: showNav ? 0 : 80 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-sm sm:hidden"
      >
        <div className="flex justify-around py-2">

          {/* HAPTIC BUTTONS */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setValue("messages")}
            className={`flex flex-col items-center text-xs ${
              value === "messages" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {t("dashboard.messages")}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setValue("todos")}
            className={`flex flex-col items-center text-xs ${
              value === "todos" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            {t("dashboard.todos")}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setValue("milestones")}
            className={`flex flex-col items-center text-xs ${
              value === "milestones" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Flag className="w-5 h-5 mb-0.5" />
            {t("dashboard.milestones")}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setValue("files")}
            className={`flex flex-col items-center text-xs ${
              value === "files" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Folder className="w-5 h-5 mb-0.5" />
            {t("dashboard.files")}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => setValue("invoices")}
            className={`flex flex-col items-center text-xs ${
              value === "invoices" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Wallet className="w-5 h-5 mb-0.5" />
            {t("dashboard.invoices")}
          </motion.button>

          {isFreelancer && (
            <motion.button
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => setValue("clients")}
              className={`flex flex-col items-center text-xs ${
                value === "clients" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <User className="w-5 h-5 mb-0.5" />
              {t("dashboard.clients")}
            </motion.button>
          )}
        </div>
      </motion.div>
    </>
  );
}
