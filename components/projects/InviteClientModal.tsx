"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog"; // or your Dialog implementation
import { createProjectInvite } from "@/app/actions/inviteClient"; // this is a server action import (callable from client only in forms)


export default function InviteClientModal({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Kunden einladen</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>Kunden per E-Mail einladen</DialogHeader>
          <div className="p-4">
            <Label htmlFor="invite-email">E-Mail des Kunden</Label>
            <Input id="invite-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="kunde@beispiel.de" />
            <p className="text-sm text-muted-foreground mt-2">
              Der Kunde erhält eine E-Mail mit einem Einladungslink (gültig 14 Tage).
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Abbrechen</Button>

            <form action={async (formData: FormData) => {
              setLoading(true);
              try {
                // call the server action. Note: server actions can be called directly from client form submissions
                await createProjectInvite(projectId, email);
                setOpen(false);
                setEmail("");
              } catch (err: any) {
                console.log(err)
              } finally {
                setLoading(false);
              }
            }}>
              <Button type="submit" disabled={loading}>
                {loading ? "Senden..." : "Einladung senden"}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
