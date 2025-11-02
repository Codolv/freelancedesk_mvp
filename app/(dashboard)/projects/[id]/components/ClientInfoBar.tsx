import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Motion} from "@/components/custom/Motion"
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import InviteClientModal from "@/components/projects/InviteClientModal";
import { getAvatarUrl } from '@/lib/supabase/getAvatarUrl';
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";

interface ClientInfoBarProps {
  clients: Array<{ id: string; email: string; avatar_url?: string | null }>;
  projectId: string;
  isFreelancer: boolean;
}

export async function ClientInfoBar({ clients, projectId, isFreelancer }: ClientInfoBarProps) {
  const locale = await getLocale();
  const dict = dictionaries[locale];
  // Fetch signed URLs for all client avatars
  const clientsWithSignedUrls = await Promise.all(
    clients.map(async (client) => {
      let signedAvatarUrl = null;
      if (client.avatar_url) {
        signedAvatarUrl = await getAvatarUrl(client.avatar_url);
      }
      return {
        ...client,
        signedAvatarUrl,
      };
    })
  );

  return (
    <Motion
      className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-background/70 backdrop-blur-sm shadow-sm"
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-sm font-semibold text-muted-foreground mr-2">{dict["project.clients.label"]}</h3>

      <TooltipProvider>
        <div className="flex items-center gap-2">
          {clientsWithSignedUrls.length > 0 ? (
            clientsWithSignedUrls.map((client) => (
              <Tooltip key={client.id}>
                <TooltipTrigger asChild>
                  <div className="relative size-9 rounded-full border-2 border-border hover:ring-2 hover:ring-primary/20 transition-all duration-150 shadow-sm cursor-pointer flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    {client.signedAvatarUrl ? (
                      <img 
                        src={client.signedAvatarUrl} 
                        alt={client.email} 
                        className="size-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-base text-gray-800 dark:text-gray-200 select-none">
                        {client.email.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{client.email}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <p className="text-xs text-muted-foreground">{dict["project.no.clients.added"]}</p>
          )}
        </div>
      </TooltipProvider>

      {isFreelancer && (
        <div className="ml-auto">
          <InviteClientModal projectId={projectId}/>
        </div>
      )}
    </Motion>
  );
}
