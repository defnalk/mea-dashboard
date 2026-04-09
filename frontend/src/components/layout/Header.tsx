import { useDashboardStore } from "@/stores/dashboardStore";
import { useRun } from "@/api/runs";

export function Header() {
  const { selectedRunId, autoRefresh, setAutoRefresh } = useDashboardStore();
  const { data: run } = useRun(selectedRunId);

  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
      <div>
        <div className="text-sm text-slate-500">Selected run</div>
        <div className="text-lg font-semibold text-slate-100">
          {run?.name ?? "No run selected"}
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={autoRefresh}
          onChange={(e) => setAutoRefresh(e.target.checked)}
          className="accent-accent"
        />
        Auto-refresh
      </label>
    </header>
  );
}
