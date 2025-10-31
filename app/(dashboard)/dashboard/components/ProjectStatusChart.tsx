"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Motion } from "@/components/custom/Motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface ProjectStatusData {
  name: string;
  value: number;
}

export default function ProjectStatusChart({ initialData }: { initialData?: ProjectStatusData[] }) {
  const data = initialData || [
    { name: "Aktiv", value: 4 },
    { name: "Abgeschlossen", value: 2 },
  ];

  const COLORS = ["#4d5d4b", "#a3b18a"];

  return (
    <Motion initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="">
      <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Projektstatus</h3>
          <p className="text-sm text-muted-foreground">Aufteilung der Projekte</p>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="80%" height="100%">
            <PieChart>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Pie data={data as any} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
                {data.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Motion>
  );
}
