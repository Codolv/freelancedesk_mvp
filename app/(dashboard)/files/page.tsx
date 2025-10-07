"use client";
import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";

type StorageFileObject = { name: string; id?: string };

export default function FilesPage() {
	const [files, setFiles] = useState<StorageFileObject[]>([]);
	const [loading, setLoading] = useState(false);

	const loadFiles = async () => {
		setLoading(true);
		try {
			const supabase = getBrowserSupabase();
			const { data, error } = await supabase.storage.from("files").list(undefined, { sortBy: { column: "name", order: "asc" } });
			if (error) throw error;
			setFiles((data as unknown as StorageFileObject[]) || []);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadFiles();
	}, []);

	const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const supabase = getBrowserSupabase();
		const { error } = await supabase.storage.from("files").upload(file.name, file, { upsert: true });
		if (error) {
			alert(error.message);
			return;
		}
		await loadFiles();
	};

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Files</h1>
			<p className="text-sm opacity-80">Uploads go to Supabase Storage bucket &quot;files&quot;. Create the bucket in your Supabase project and allow authenticated reads/writes.</p>
			<input type="file" onChange={onUpload} />
			<div className="border rounded-md divide-y">
				{loading && <div className="p-3 text-sm">Loading...</div>}
				{!loading && files.length === 0 && <div className="p-3 text-sm">No files yet</div>}
				{files.map((f) => (
					<div key={f.name} className="p-3 text-sm flex items-center justify-between">
						<span>{f.name}</span>
						<a className="underline" target="_blank" href={`#`} rel="noreferrer">Download</a>
					</div>
				))}
			</div>
		</div>
	);
}
