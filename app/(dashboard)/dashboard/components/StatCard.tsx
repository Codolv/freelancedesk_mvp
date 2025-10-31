"use client";

import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  FolderKanban,
  CheckCircle2,
  Wallet,
  FileText,
} from "lucide-react";

export default function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: "projects" | "check" | "wallet" | "invoice";
}) {
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
          <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
          <div className="text-muted-foreground">{Icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </CardContent>
      </Card>
    </Motion>
  );
}
