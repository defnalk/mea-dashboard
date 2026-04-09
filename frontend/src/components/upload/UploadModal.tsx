import { useState } from "react";
import { useUploadRun } from "@/api/runs";
import { UploadReport } from "./UploadReport";
import type { PlantRun } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UploadModal({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<PlantRun | null>(null);
  const upload = useUploadRun();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return;
    try {
      const run = await upload.mutateAsync({ file, name, onProgress: setProgress });
      setResult(run);
    } catch {
      /* surfaced via mutation.isError below */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Upload plant run</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>

        {result ? (
          <>
            <UploadReport run={result} />
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
                setName("");
                setProgress(0);
                onClose();
              }}
              className="mt-4 w-full rounded-lg bg-accent py-2 text-slate-900 font-medium"
            >
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Run name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">CSV file</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="mt-1 w-full text-sm text-slate-300"
                required
              />
            </div>
            {upload.isPending && (
              <div className="h-2 w-full rounded bg-slate-800">
                <div className="h-full rounded bg-accent" style={{ width: `${progress}%` }} />
              </div>
            )}
            {upload.isError && (
              <div className="text-sm text-red-400">Upload failed. Check the file format.</div>
            )}
            <button
              type="submit"
              disabled={upload.isPending}
              className="w-full rounded-lg bg-accent py-2 text-slate-900 font-medium disabled:opacity-50"
            >
              {upload.isPending ? "Uploading…" : "Upload"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
