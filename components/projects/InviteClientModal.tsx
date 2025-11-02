"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { createProjectInvite } from "@/app/actions/inviteClient";
import { useT } from "@/lib/i18n/client";

export default function InviteClientModal({
  projectId,
}: {
  projectId: string;
}) {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const emailValue = formData.get("email")?.toString() || "";
    startTransition(async () => {
      try {
        await createProjectInvite(projectId, emailValue);
        setOpen(false);
        setEmail("");
      } catch (err: any) {
        console.error(err);
      }
    });
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
      >
        <Mail className="mr-2 h-4 w-4" />
        {t("project.invite.client.button")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-background/90 backdrop-blur-md border border-border/60 shadow-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                {t("project.invite.client.title")}
              </DialogTitle>
            </DialogHeader>

            <form action={handleSubmit} className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">{t("project.invite.email.label")}</Label>
                <Input
                  id="invite-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kunde@beispiel.de"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {t("project.invite.email.description")}
                </p>
              </div>

              <DialogFooter className="flex justify-end gap-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  {t("project.invite.cancel")}
                </Button>

                <Button
                  type="submit"
                  disabled={pending}
                  className="bg-[hsl(85,30%,35%)] hover:bg-[hsl(85,30%,30%)] text-white"
                >
                  {pending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {pending ? t("project.invite.sending") : t("project.invite.send.button")}
                </Button>
              </DialogFooter>
            </form>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
