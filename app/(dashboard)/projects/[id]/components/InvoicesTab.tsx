// app/projects/[id]/components/InvoicesTab.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { markInvoicePaid, deleteInvoice } from "../actions";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";

export function InvoicesTab({ invoices, projectId }: any) {
  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Rechnungen</h2>
                <p className="text-sm text-muted-foreground">
                  Verwalte und markiere Rechnungen als bezahlt.
                </p>
              </div>
              <Button asChild>
                <Link href={`/projects/${projectId}/invoices/new`}>
                  + Neue Rechnung
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {(invoices || []).length === 0 && (
                <div className="text-sm text-muted-foreground">
                  Noch keine Rechnungen.
                </div>
              )}
              {(invoices || []).map((inv: any, idx: number) => (
                <Motion
                  key={inv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between text-sm border rounded-md p-3 bg-card hover:bg-muted/50 transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{inv.title}</div>
                    <div className="text-muted-foreground">
                      {(inv.amount_cents / 100).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}{" "}
                      • {inv.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {inv.status === "Open" && (
                      <form
                        action={markInvoicePaid.bind(null, projectId, inv.id)}
                        className="inline"
                      >
                        <Button variant="outline" size="sm">
                          Bezahlt
                        </Button>
                      </form>
                    )}
                    <form
                      action={deleteInvoice.bind(null, projectId, inv.id)}
                      className="inline"
                    >
                      <Button variant="destructive" size="sm">
                        Löschen
                      </Button>
                    </form>
                  </div>
                </Motion>
              ))}
            </CardContent>
          </Card>
  );
}
