import { LineChart, Line, ResponsiveContainer } from "recharts";
import { colorFor } from "@/utils/colors";
import { formatSensorValue } from "@/utils/formatters";
import { SENSOR_DISPLAY_NAMES } from "@/utils/constants";

export type SensorStatus = "normal" | "warning" | "alarm";

interface Props {
  sensor: string;
  value: number | null;
  unit: string;
  history: { value: number }[];
  status: SensorStatus;
}

const dotColor: Record<SensorStatus, string> = {
  normal: "bg-emerald-500",
  warning: "bg-amber-500",
  alarm: "bg-red-500",
};

export function SensorCard({ sensor, value, unit, history, status }: Props) {
  const display = SENSOR_DISPLAY_NAMES[sensor] ?? sensor;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{sensor}</div>
          <div className="text-sm text-slate-300">{display}</div>
        </div>
        <span className={`h-3 w-3 rounded-full ${dotColor[status]}`} />
      </div>
      <div className="mt-4 text-3xl font-semibold text-slate-100">
        {value === null ? "—" : formatSensorValue(value, unit)}
      </div>
      <div className="mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history.slice(-50)}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={colorFor(sensor)}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
