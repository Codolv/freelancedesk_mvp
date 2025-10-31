"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function RevenueChart({ data }: { data: any[] }) {
  return (
    <Card className="bg-background/80 border-border/60 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Einnahmenverlauf</h3>
        <p className="text-sm text-muted-foreground">
          Monatliche Einnahmen (letzte Zahlungen)
        </p>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.06} />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${v}€`} />
            <Tooltip formatter={(v: number) => `${v.toLocaleString("de-DE")} €`} />
            <Line type="monotone" dataKey="value" stroke="#4d5d4b" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
