"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useT } from "@/lib/i18n/client";

const COLORS = ["#4d5d4b", "#a3b18a"];

interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number; // ✅ Macht kompatibel mit Recharts' ChartDataInput
}

export default function ProjectStatusChart({ data = [] }: { data?: ChartData[] }) {
  const { t } = useT();

  return (
    <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {t("dashboard.project.status")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("dashboard.project.distribution")}
        </p>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        {data.length > 0 ? (
          <ResponsiveContainer width="80%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={80}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t("dashboard.noData")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
