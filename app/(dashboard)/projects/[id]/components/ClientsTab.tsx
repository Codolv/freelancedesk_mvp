"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { resendInvite, revokeInvite } from "@/app/actions/inviteClient";

export function ClientsTab({
  clients = [],
  invites = [],
  projectId,
}: {
  clients: Array<{ id: string; email: string }>;
  invites: Array<{ id: string; email: string; accepted: boolean }>;
  projectId: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleResend = (inviteId: string) => {
    startTransition(async () => {
      await resendInvite(inviteId);
    });
  };

  const handleRevoke = (inviteId: string) => {
    startTransition(async () => {
      await revokeInvite(inviteId);
    });
  };

  return (
    <motion.div
      className="grid gap-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-1">Kunden</h3>
            <p className="text-sm text-muted-foreground">
              Übersicht deiner eingeladenen Kunden und deren Status.
            </p>
          </div>
          <Separator />

          {/* Accepted clients */}
          {clients.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
            Aktive Kunden
          </h4>
          {clients.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40 transition bg-card"
            >
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate block">{c.email}</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-green-500 text-xs font-semibold bg-green-100 px-2 py-1 rounded-full">
                  Angenommen
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRevoke(c.id)}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
          )}

          {/* Pending invites */}
          {invites.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                Ausstehende Einladungen
              </h4>
              {invites.map((i) => (
                <div
                  key={i.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40 transition bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <span className="font-medium truncate block">{i.email}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <span className="text-yellow-500 text-xs font-semibold bg-yellow-100 px-2 py-1 rounded-full">
                      Offen
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleResend(i.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRevoke(i.id)}
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {clients.length === 0 && invites.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Noch keine Kunden eingeladen.
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
