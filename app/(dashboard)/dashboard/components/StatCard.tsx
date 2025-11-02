"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FolderKanban,
  CheckCircle2,
  Wallet,
  FileText,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";

export default function StatCard({
  labelKey,
  value,
  hintKey,
  icon,
}: {
  labelKey: string;
  value: string | number;
  hintKey?: string;
  icon?: "projects" | "check" | "wallet" | "invoice";
}) {
  const { t } = useT();
  const Icon = (() => {
    switch (icon) {
      case "projects":
        return <FolderKanban className="h-5 w-5" />;
      case "check":
        return <CheckCircle2 className="h-5 w-5" />;
      case "wallet":
        return <Wallet className="h-5 w-5" />;
      case "invoice":
      default:
        return <FileText className="h-5 w-5" />;
    }
  })();

  return (
    <Motion
      className="rounded-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
    >
      <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
        <CardHeader className="flex items-start justify-between pb-2">
          <CardTitle className="text-sm text-muted-foreground">{t(labelKey)}</CardTitle>
          <div className="text-muted-foreground">{Icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {hintKey && <div className="text-xs text-muted-foreground mt-1">{t(hintKey)}</div>}
        </CardContent>
      </Card>
    </Motion>
  );
}
