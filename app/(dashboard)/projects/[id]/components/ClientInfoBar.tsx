"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import InviteClientModal from "@/components/projects/InviteClientModal";

interface ClientInfoBarProps {
  clients: Array<{ id: string; email: string; avatar_url?: string | null }>;
  projectId: string;
  isFreelancer: boolean;
}

export function ClientInfoBar({ clients, projectId, isFreelancer }: ClientInfoBarProps) {
  return (
    <motion.div
      className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-background/70 backdrop-blur-sm shadow-sm"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-sm font-semibold text-muted-foreground mr-2">Kunden:</h3>

      <TooltipProvider>
        <div className="flex -space-x-2">
          {clients.length > 0 ? (
            clients.map((client) => (
              <Tooltip key={client.id}>
                <TooltipTrigger asChild>
                  <Avatar className="border-2 border-background hover:scale-105 transition-transform duration-150">
                    {client.avatar_url ? (
                      <AvatarImage src={client.avatar_url} alt={client.email} />
                    ) : (
                      <AvatarFallback>
                        {client.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{client.email}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">Keine Kunden hinzugefügt.</p>
          )}
        </div>
      </TooltipProvider>

      {isFreelancer && (
        <div className="ml-auto">
          <InviteClientModal projectId={projectId}/>
        </div>
      )}
    </motion.div>
  );
}
