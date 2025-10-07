// app/projects/[id]/components/FilesTab.tsx
"use client";

import { uploadFile } from "../actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function FilesTab({ files, projectId }: any) {
  return (
    <div className="grid gap-3">
      <form action={uploadFile.bind(null, projectId)} className="flex items-center gap-2">
        <Input type="file" name="file" />
        <Button type="submit">Hochladen</Button>
      </form>

      <div className="grid gap-2">
        {(!files || files.length === 0) && (
          <div className="opacity-70 text-sm">Noch keine Dateien.</div>
        )}
        {files.map((f: any) => (
          <div key={f.name} className="flex items-center justify-between text-sm">
            <span>{f.name}</span>
            <a
              className="underline text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noreferrer"
              href={`https://<your-supabase-project>.supabase.co/storage/v1/object/public/files/${projectId}/${f.name}`}
            >
              Download
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
