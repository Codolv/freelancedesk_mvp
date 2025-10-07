"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ItemsField() {
	const [rows, setRows] = useState<Array<{ description: string; qty: number; unit_price: number }>>([
		{ description: "", qty: 1, unit_price: 0 },
	]);
	const addRow = () => setRows((r) => [...r, { description: "", qty: 1, unit_price: 0 }]);
	const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
	const update = (i: number, key: "description" | "qty" | "unit_price", value: string) => {
		setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [key]: key === "description" ? value : Number(value) } : row)));
	};
	const payload = rows.map((r) => ({ description: r.description, qty: r.qty, unit_price_cents: Math.round((r.unit_price || 0) * 100) }));
	const total = rows.reduce((s, r) => s + (r.qty || 0) * (r.unit_price || 0), 0);
	return (
		<div className="grid gap-3">
			<input type="hidden" name="items" value={JSON.stringify(payload)} />
			{rows.map((row, i) => (
				<div key={i} className="grid grid-cols-12 gap-2 items-end">
					<div className="col-span-6">
						<Label>Beschreibung</Label>
						<Input value={row.description} onChange={(e) => update(i, "description", e.target.value)} placeholder="Leistung" />
					</div>
					<div className="col-span-2">
						<Label>Menge</Label>
						<Input type="number" min={0} value={row.qty} onChange={(e) => update(i, "qty", e.target.value)} />
					</div>
					<div className="col-span-3">
						<Label>Einzelpreis (EUR)</Label>
						<Input type="number" step="0.01" min={0} value={row.unit_price} onChange={(e) => update(i, "unit_price", e.target.value)} />
					</div>
					<div className="col-span-1">
						<Button type="button" variant="outline" onClick={() => removeRow(i)}>–</Button>
					</div>
				</div>
			))}
			<div className="flex items-center gap-2">
				<Button type="button" variant="outline" onClick={addRow}>+ Position</Button>
				<div className="ml-auto text-sm opacity-80">Summe: {total.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
			</div>
		</div>
	);
}

