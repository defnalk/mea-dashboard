import { useMemo, useState } from "react";
import { useAlarms, useAlarmStats } from "@/api/alarms";
import { useDashboardStore } from "@/stores/dashboardStore";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { AlarmTable } from "@/components/dashboard/AlarmTable";

export default function AlarmHistoryPage() {
  const runId = useDashboardStore((s) => s.selectedRunId);
  const { data: alarms, isLoading } = useAlarms(runId);
  const { data: stats } = useAlarmStats(runId);
  const [sensorFilter, setSensorFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const filtered = useMemo(() => {
    if (!alarms) return [];
    return alarms.filter(
      (a) =>
        (!sensorFilter || a.sensor_name === sensorFilter) &&
        (!typeFilter || a.alarm_type === typeFilter),
    );
  }, [alarms, sensorFilter, typeFilter]);

  if (!runId) return <EmptyState title="No run selected" />;
  if (isLoading) return <LoadingSpinner />;

  const topSensor =
    stats && Object.entries(stats.by_sensor).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Alarm history</h1>

      {stats && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Total" value={stats.total} />
          <Stat label="Top sensor" value={topSensor ?? "—"} />
          <Stat label="Types" value={Object.keys(stats.by_type).length} />
        </div>
      )}

      <div className="flex gap-2">
        <select
          value={sensorFilter}
          onChange={(e) => setSensorFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="">All sensors</option>
          {Array.from(new Set(alarms?.map((a) => a.sensor_name) ?? [])).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        >
          <option value="">All types</option>
          <option value="HIGH">HIGH</option>
          <option value="LOW">LOW</option>
          <option value="RATE_OF_CHANGE">RATE_OF_CHANGE</option>
        </select>
      </div>

      <AlarmTable alarms={filtered} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-100">{value}</div>
    </div>
  );
}
