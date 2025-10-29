// app/projects/[id]/components/ProjectTabsScroll.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Folder, Wallet, User } from "lucide-react";
import { MessagesTab } from "./components/MessagesTab";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";

interface ProjectMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  user_email?: string;
  user_role?: string;
}

interface ProjectFile {
  id: string;
  name: string;
  url: string;
  created_at: string;
  user_id: string;
}

interface ProjectInvoice {
  id: string;
  title: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

interface Client {
  id: string;
  email: string;
  accepted: boolean;
  role: string;
}

interface ProjectTabsScrollProps {
  projectId: string;
  isFreelancer: boolean;
  messages: any[]; // Temporarily use any to resolve type issues // Temporarily use any to resolve the type mismatch
  files: ProjectFile[];
  invoices: ProjectInvoice[];
  acceptedClients: Client[];
  pendingInvites: Client[];
}

export default function ProjectTabsScroll({
  projectId,
  isFreelancer,
  messages,
  files,
  invoices,
  acceptedClients,
  pendingInvites,
}: ProjectTabsScrollProps) {
  const [value, setValue] = useState<string>("messages");

  // wrapper ref for the scrollable content
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // ensure initial scroll position at top when switching tabs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [value]);

  return (
    <div className="flex-1 flex flex-col min-h-0"> {/* min-h-0 is important for correct flex overflow */}
      <Tabs value={value} onValueChange={setValue} className="w-full">
        <TabsList className="mb-2 flex flex-wrap">
          <TabsTrigger value="messages" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Nachrichten</TabsTrigger>
          <TabsTrigger value="files" className="flex items-center gap-2"><Folder className="h-4 w-4" /> Dateien</TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2"><Wallet className="h-4 w-4" /> Rechnungen</TabsTrigger>
          {isFreelancer && <TabsTrigger value="clients" className="flex items-center gap-2"><User className="h-4 w-4" /> Kunden</TabsTrigger>}
        </TabsList>

        {/* Scrollable content area: only this scrolls */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6" style={{ WebkitOverflowScrolling: "touch", scrollbarGutter: 'stable' }}>
          <div style={{ display: value === "messages" ? "block" : "none" }}>
            <MessagesTab messages={messages} projectId={projectId} />
          </div>

          <div style={{ display: value === "files" ? "block" : "none" }}>
            <FilesTab files={files} projectId={projectId} canUpload={isFreelancer} />
          </div>

          <div style={{ display: value === "invoices" ? "block" : "none" }}>
            <InvoicesTab invoices={invoices} projectId={projectId} canManage={isFreelancer} />
          </div>

          {isFreelancer && (
            <div style={{ display: value === "clients" ? "block" : "none" }}>
              <ClientsTab clients={acceptedClients} invites={pendingInvites} />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
