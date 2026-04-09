import {
  Brush,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReadingPoint, Resolution } from "@/types";
import { colorFor } from "@/utils/colors";
import { useDashboardStore } from "@/stores/dashboardStore";
import { formatTimestamp } from "@/utils/formatters";

interface Props {
  data: ReadingPoint[];
}

const RESOLUTIONS: Resolution[] = ["raw", "1min", "5min", "15min"];

export function TimeSeriesChart({ data }: Props) {
  const { resolution, setResolution } = useDashboardStore();

  // Pivot to [{ timestamp, TT101: 85.2, FT103: 900.3, ... }]
  const grouped = new Map<string, Record<string, number | string>>();
  const sensors = new Set<string>();
  for (const p of data) {
    sensors.add(p.sensor_name);
    const key = p.timestamp;
    if (!grouped.has(key)) grouped.set(key, { timestamp: key });
    grouped.get(key)![p.sensor_name] = p.value;
  }
  const rows = Array.from(grouped.values()).sort((a, b) =>
    String(a.timestamp).localeCompare(String(b.timestamp)),
  );

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Time series</h2>
        <div className="flex gap-1">
          {RESOLUTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`rounded px-2 py-1 text-xs ${
                resolution === r
                  ? "bg-accent text-slate-900"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              stroke="#64748b"
              fontSize={12}
              tickFormatter={(v) => formatTimestamp(v as string)}
              minTickGap={32}
            />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
              labelFormatter={(v) => formatTimestamp(v as string, true)}
            />
            <Legend />
            {Array.from(sensors).map((s) => (
              <Line
                key={s}
                type="monotone"
                dataKey={s}
                stroke={colorFor(s)}
                strokeWidth={2}
                dot={false}
                connectNulls
                isAnimationActive={false}
              />
            ))}
            <Brush dataKey="timestamp" height={20} stroke="#10b981" travellerWidth={8} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
