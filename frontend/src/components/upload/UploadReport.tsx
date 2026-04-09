import type { PlantRun } from "@/types";

export function UploadReport({ run }: { run: PlantRun }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/60 p-4 text-sm">
      <div className="font-semibold text-slate-200">{run.name}</div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-slate-400">
        <dt>Readings</dt>
        <dd className="text-slate-200">{run.reading_count}</dd>
        <dt>Alarms triggered</dt>
        <dd className={run.alarm_count ? "text-red-400" : "text-emerald-400"}>
          {run.alarm_count}
        </dd>
        <dt>Start</dt>
        <dd className="text-slate-200">{run.start_time ?? "—"}</dd>
        <dt>End</dt>
        <dd className="text-slate-200">{run.end_time ?? "—"}</dd>
      </dl>
    </div>
  );
}
