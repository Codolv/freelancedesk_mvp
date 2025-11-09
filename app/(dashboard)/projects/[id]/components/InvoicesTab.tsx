"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import Link from "next/link";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatInvoiceDate } from "@/lib/i18n/date-format";
import { useT } from "@/lib/i18n/client";
import { FileEdit, FileText, Trash2, CheckCircle } from "lucide-react";
import { deleteInvoice, markInvoicePaid } from "../actions";

interface Invoice {
  id: string;
  title: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

export function InvoicesTab({ 
  invoices, 
  projectId, 
  isFreelancer,
  canManage = true
}: { 
  invoices: Invoice[]; 
  projectId: string; 
  isFreelancer: boolean; 
  canManage?: boolean; 
}) {
  const { t } = useT();
  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{t("dashboard.invoices")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("project.invoices.overview")}
          </p>
        </div>
        <Button asChild>
          <Link href={`/projects/${projectId}/invoices/new`}>
            <FileText className="mr-2 h-4 w-4" /> {t("project.new.invoice")}
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("project.invoices.none")}
          </p>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv, idx: number) => (
              <Motion
                key={inv.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-border/60 rounded-md p-4 hover:bg-muted/30 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium truncate">{inv.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatInvoiceDate(inv.created_at, "de") /* Using "de" as fallback for now */}
                    {" • "}
                    {inv.status === "Paid" ? (
                      <span className="text-green-600 font-medium">{t("project.invoices.paid")}</span>
                    ) : (
                      <span className="text-yellow-600 font-medium">{t("project.invoices.open")}</span>
                    )}
                  </p>
                </div>

                <div className="text-sm font-semibold">
                  {(inv.amount_cents / 100).toLocaleString("de-DE", {
                    style: "currency",
                    currency: "EUR",
                  })}
                </div>

                {canManage && <div className="flex items-center gap-2">
                  {/* View Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/projects/${projectId}/invoices/${inv.id}/view`}>
                      <FileText className="h-4 w-4 mr-1" /> {t("project.view")}
                    </Link>
                  </Button>

                  {/* Edit Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link href={`/projects/${projectId}/invoices/${inv.id}`}>
                      <FileEdit className="h-4 w-4 mr-1" /> {t("project.edit")}
                    </Link>
                  </Button>

                  {/* Mark Paid Button */}
                  <form action={markInvoicePaid.bind(null, projectId, inv.id)}>
                    <Button
                      variant={inv.status === "Paid" ? "outline" : "secondary"}
                      size="sm"
                      type="submit"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      {inv.status === "Paid" ? t("project.invoices.mark.open") : t("project.invoices.mark.paid")}
                    </Button>
                  </form>

                  {/* Delete Button */}
                  <form action={deleteInvoice.bind(null, projectId, inv.id)}>
                    <Button variant="destructive" size="sm" type="submit" className="text-red">
                      <Trash2 className="h-4 w-4 mr-1" /> {t("project.delete")}
                    </Button>
                  </form>
                </div>}
              </Motion>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
