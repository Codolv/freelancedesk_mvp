"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Folder, Wallet, User, CheckSquare } from "lucide-react";
import { Comments } from "./components/Comments";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";
import { TodosTab } from "./components/TodosTab";

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
  todos
}: any) {
  const [value, setValue] = useState<string>("messages");

  // measured height of active content (px)
  const [height, setHeight] = useState<number | "auto">("auto");

  // refs for each content panel so we can measure
  const refs = {
    messages: useRef<HTMLDivElement | null>(null),
    todos: useRef<HTMLDivElement | null>(null),
    files: useRef<HTMLDivElement | null>(null),
    invoices: useRef<HTMLDivElement | null>(null),
    clients: useRef<HTMLDivElement | null>(null),
  };

  // helper to measure active panel
  const measure = useCallback((key: string) => {
    const el = (refs as any)[key]?.current as HTMLDivElement | null;
    if (!el) {
      setHeight("auto");
      return;
    }
    const rect = el.getBoundingClientRect();
    setHeight(Math.ceil(rect.height));
  }, []);

  // measure on mount and when value changes
  useEffect(() => {
    // small timeout to allow children to mount and images/fonts to paint
    const t = setTimeout(() => measure(value), 40);
    return () => clearTimeout(t);
  }, [value, measure]);

  // observe size changes inside the active panel (handles images, late content, markdown)
  useEffect(() => {
    const el = (refs as any)[value]?.current as HTMLDivElement | null;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measure(value);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [value, measure]);

  // optional: set min height so layout doesn't bounce if height briefly becomes 0
  const containerStyle: React.CSSProperties =
    height === "auto"
      ? { height: "auto", transition: "height 220ms ease" }
      : { height: height + "px", transition: "height 220ms ease" };

  // Render content panels but only the active one is visible (others kept mounted but hidden for instant measurement)
  // If you prefer to unmount inactive panels, change `display` logic — but keeping mounted reduces remount cost.
  return (
    <>
      <Tabs value={value} onValueChange={(v) => setValue(v)} className="w-full">
        <TabsList className="mb-4 flex flex-wrap">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Nachrichten
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" /> Aufgaben
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2">
            <Folder className="h-4 w-4" /> Dateien
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" /> Rechnungen
          </TabsTrigger>
          {isFreelancer && (
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <User className="h-4 w-4" /> Kunden
            </TabsTrigger>
          )}
        </TabsList>
      </Tabs>

      {/* Animated height container */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        style={containerStyle}
        className="w-full overflow-hidden"
      >
        {/* inner wrapper that scrolls if content overflows */}
        <div className="w-full">
          {/* Messages panel */}
          <div
            ref={refs.messages}
            style={{ display: value === "messages" ? "block" : "none" }}
          >
            <Comments
              projectId={projectId}
              messages={messages}
              user={user}
            />
          </div>

          {/* Todos panel */}
          <div
            ref={refs.todos}
            style={{ display: value === "todos" ? "block" : "none" }}
          >
            <TodosTab
              projectId={projectId}
              isFreelancer={isFreelancer}
              initialTodos={todos}
            />
          </div>

          {/* Files panel */}
          <div
            ref={refs.files}
            style={{ display: value === "files" ? "block" : "none" }}
          >
            <FilesTab files={files || []} projectId={projectId} canUpload={isFreelancer} />
          </div>

          {/* Invoices panel */}
          <div
            ref={refs.invoices}
            style={{ display: value === "invoices" ? "block" : "none" }}
          >
            <InvoicesTab invoices={invoices || []} projectId={projectId} isFreelancer={isFreelancer} />
          </div>

          {/* Clients panel */}
          {isFreelancer && (
            <div
              ref={refs.clients}
              style={{ display: value === "clients" ? "block" : "none" }}
            >
              <ClientsTab projectId={projectId} clients={acceptedClients || []} invites={pendingInvites || []} />
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
