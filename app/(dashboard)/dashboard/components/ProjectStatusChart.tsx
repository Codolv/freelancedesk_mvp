"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

const COLORS = ["#4d5d4b", "#a3b18a"];

export default function ProjectStatusChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Projektstatus</h3>
        <p className="text-sm text-muted-foreground">Aufteilung der Projekte</p>
      </CardHeader>
      <CardContent className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="80%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80} label>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
