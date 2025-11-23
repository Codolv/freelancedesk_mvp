"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Folder, Wallet, User, CheckSquare, Flag } from "lucide-react";
import { Comments } from "./components/Comments";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";
import { TodosTab } from "./components/TodosTab";
import { MilestonesTab } from "./components/MilestonesTab";
import { useT } from "@/lib/i18n/client";

interface MessageProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface MessageWithAvatar {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: (MessageProfile & { signedAvatarUrl: string | null }) | null;
}

interface File {
  id: string;
  project_id: string;
  name: string;
  path: string;
  size_bytes: number;
  mime_type: string;
  description: string;
  uploaded_by: string;
  version: number;
  created_at: string;
  updated_at: string;
}

interface Invoice {
  id: string;
  project_id: string;
  title: string;
  status: string;
  amount_cents: number;
  currency: string;
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface ProjectInvite {
  id: string;
  email: string;
  accepted: boolean;
}

interface Todo {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  created_at: string;
  created_by: string;
  profiles: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface MilestoneProfile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}

interface Milestone {
 id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  due_date: string | null;
  target_date: string | null;
  actual_completion_date: string | null;
  order_number: number;
  created_at: string;
  created_by: string;
  profiles: MilestoneProfile | null;
}

interface ProjectTabsAnimatedProps {
  projectId: string;
  isFreelancer: boolean;
  isClient: boolean;
  messages: MessageWithAvatar[];
  files: File[];
  invoices: Invoice[];
  acceptedClients: UserProfile[];
  pendingInvites: ProjectInvite[];
  user: UserProfile | null;
  todos: Todo[];
  milestones: Milestone[];
}

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

  // measured height of active content (px)
  const [height, setHeight] = useState<number | "auto">("auto");

  // refs for each content panel so we can measure
  const refs = {
    messages: useRef<HTMLDivElement>(null),
    todos: useRef<HTMLDivElement>(null),
    milestones: useRef<HTMLDivElement>(null),
    files: useRef<HTMLDivElement>(null),
    invoices: useRef<HTMLDivElement>(null),
    clients: useRef<HTMLDivElement>(null),
  };

  // helper to measure active panel
  const measure = useCallback((key: keyof typeof refs) => {
    const el = refs[key]?.current;
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
    const t = setTimeout(() => measure(value as keyof typeof refs), 40);
    return () => clearTimeout(t);
  }, [value, measure]);

  // observe size changes inside the active panel (handles images, late content, markdown)
  useEffect(() => {
    const el = refs[value as keyof typeof refs]?.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      measure(value as keyof typeof refs);
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
        <TabsList className="mb-4 flex flex-wrap gap-1 justify-center items-center w-full">
          <TabsTrigger value="messages" className="flex items-center gap-1 text-xs sm:text-sm px-1.5 py-1 whitespace-nowrap max-w-[100px] truncate">
            <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:block ml-1">{t("dashboard.messages")}</span>
          </TabsTrigger>
          <TabsTrigger value="todos" className="flex items-center gap-1 text-xs sm:text-sm px-1.5 py-1 whitespace-nowrap max-w-[100px] truncate">
            <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:block ml-1">{t("dashboard.todos")}</span>
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-1 text-xs sm:text-sm px-1.5 py-1 whitespace-nowrap max-w-[100px] truncate">
            <Flag className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:block ml-1">{t("dashboard.milestones")}</span>
          </TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-1 text-xs sm:text-sm px-1.5 py-1 whitespace-nowrap max-w-[100px] truncate">
            <Folder className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:block ml-1">{t("dashboard.files")}</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-1 text-xs sm:text-sm px-1.5 py-1 whitespace-nowrap max-w-[100px] truncate">
            <Wallet className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:block ml-1">{t("dashboard.invoices")}</span>
          </TabsTrigger>
          {isFreelancer && (
            <TabsTrigger value="clients" className="flex items-center gap-1 text-xs sm:text-sm px-1.5 py-1 whitespace-nowrap max-w-[100px] truncate">
              <User className="h-3 w-3 sm:h-4 sm:w-4" /> <span className="hidden sm:block ml-1">{t("dashboard.clients")}</span>
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

          {/* Milestones panel */}
          <div
            ref={refs.milestones}
            style={{ display: value === "milestones" ? "block" : "none" }}
          >
            <MilestonesTab
              projectId={projectId}
              isFreelancer={isFreelancer}
              initialMilestones={milestones}
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
            <InvoicesTab invoices={invoices || []} projectId={projectId} isFreelancer={isFreelancer} canManage={isFreelancer} />
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
