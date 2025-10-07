"use client";
import { useEffect, useState } from "react";

type Update = { id: number; title: string; body: string; date: string };

export default function UpdatesPage() {
	const [updates, setUpdates] = useState<Update[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/updates");
				const json = await res.json();
				setUpdates(json.updates || []);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Updates</h1>
			{loading && <div className="text-sm">Loading...</div>}
			<div className="grid gap-3">
				{updates.map((u) => (
					<div key={u.id} className="rounded-md border p-3">
						<div className="text-sm opacity-70">{u.date}</div>
						<div className="font-medium">{u.title}</div>
						<p className="text-sm">{u.body}</p>
					</div>
				))}
			</div>
		</div>
	);
}
