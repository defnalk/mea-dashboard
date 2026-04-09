import { NavLink } from "react-router-dom";
import { useRuns } from "@/api/runs";
import { useDashboardStore } from "@/stores/dashboardStore";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/runs", label: "Runs" },
  { to: "/alarms", label: "Alarms" },
  { to: "/analysis", label: "Analysis" },
];

export function Sidebar() {
  const { data: runs } = useRuns();
  const { selectedRunId, setSelectedRunId } = useDashboardStore();

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 p-4">
      <div className="text-lg font-semibold text-accent mb-6">MEA Dashboard</div>
      <nav className="flex flex-col gap-1 mb-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `rounded-lg px-3 py-2 text-sm ${
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-slate-300 hover:bg-slate-800/60"
              }`
            }
            end
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">Runs</div>
      <div className="flex-1 overflow-y-auto space-y-1">
        {runs?.map((run) => (
          <button
            key={run.id}
            onClick={() => setSelectedRunId(run.id)}
            className={`w-full truncate rounded-md px-2 py-1.5 text-left text-sm ${
              selectedRunId === run.id
                ? "bg-slate-800 text-white"
                : "text-slate-400 hover:bg-slate-800/40"
            }`}
            title={run.name}
          >
            {run.name}
            <span className="ml-1 text-xs text-slate-500">({run.alarm_count})</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
