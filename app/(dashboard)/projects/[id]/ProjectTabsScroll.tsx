// app/projects/[id]/components/ProjectTabsScroll.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MessageSquare, Folder, Wallet, User } from "lucide-react";
import { MessagesTab } from "./components/MessagesTab";
import { FilesTab } from "./components/FilesTab";
import { InvoicesTab } from "./components/InvoicesTab";
import { ClientsTab } from "./components/ClientsTab";

export default function ProjectTabsScroll({
  projectId,
  isFreelancer,
  isClient,
  messages,
  files,
  invoices,
  acceptedClients,
  pendingInvites,
}: any) {
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto pr-2 space-y-6" style={{ WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: value === "messages" ? "block" : "none" }}>
            <MessagesTab messages={messages} projectId={projectId} userRole={isFreelancer ? "freelancer" : "client"} />
          </div>

          <div style={{ display: value === "files" ? "block" : "none" }}>
            <FilesTab files={files} projectId={projectId} canUpload={isFreelancer} />
          </div>

          <div style={{ display: value === "invoices" ? "block" : "none" }}>
            <InvoicesTab invoices={invoices} projectId={projectId} isFreelancer={isFreelancer} canManage={isFreelancer} />
          </div>

          {isFreelancer && (
            <div style={{ display: value === "clients" ? "block" : "none" }}>
              <ClientsTab projectId={projectId} clients={acceptedClients} invites={pendingInvites} />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
}
