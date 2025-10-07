// app/projects/[id]/components/InvoicesTab.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { markInvoicePaid, deleteInvoice } from "../actions";

export function InvoicesTab({ invoices, projectId }: any) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rechnungen</h2>
        <Button asChild>
          <Link href={`/projects/${projectId}/invoices/new`}>Neue Rechnung</Link>
        </Button>
      </div>

      <div className="grid gap-2">
        {(!invoices || invoices.length === 0) && (
          <div className="opacity-70 text-sm">Noch keine Rechnungen.</div>
        )}

        {invoices.map((inv: any) => (
          <div
            key={inv.id}
            className="flex items-center justify-between text-sm rounded-md border p-3 bg-white/5 gap-3"
          >
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{inv.title}</div>
              <div className="opacity-70">
                {(inv.amount_cents / 100).toLocaleString("de-DE", {
                  style: "currency",
                  currency: "EUR",
                })}{" "}
                • {inv.status}
              </div>
            </div>
            <div className="opacity-70 text-xs">
              {new Date(inv.created_at).toLocaleDateString("de-DE")}
            </div>
            <div className="flex items-center gap-2">
              {inv.status === "Open" ? (
                <form action={markInvoicePaid.bind(null, projectId, inv.id)}>
                  <Button className="px-3 py-1 rounded-md border">Bezahlt</Button>
                </form>
              ) : null}
              <form action={deleteInvoice.bind(null, projectId, inv.id)}>
                <Button className="px-3 py-1 rounded-md border">Löschen</Button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
