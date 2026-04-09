import type { AlarmEvent } from "@/types";
import { formatTimestamp } from "@/utils/formatters";

interface Props {
  alarms: AlarmEvent[];
}

const typeBadge: Record<AlarmEvent["alarm_type"], string> = {
  HIGH: "bg-red-500/20 text-red-300",
  LOW: "bg-amber-500/20 text-amber-300",
  RATE_OF_CHANGE: "bg-purple-500/20 text-purple-300",
};

export function AlarmTable({ alarms }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="min-w-full divide-y divide-slate-700 text-sm">
        <thead className="bg-slate-800/60 text-left text-xs uppercase text-slate-400">
          <tr>
            <th className="px-3 py-2">Time</th>
            <th className="px-3 py-2">Sensor</th>
            <th className="px-3 py-2">Type</th>
            <th className="px-3 py-2">Threshold</th>
            <th className="px-3 py-2">Actual</th>
            <th className="px-3 py-2">Message</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {alarms.map((a) => (
            <tr key={a.id} className="hover:bg-slate-800/40">
              <td className="px-3 py-2 text-slate-400">{formatTimestamp(a.triggered_at, true)}</td>
              <td className="px-3 py-2 font-mono text-slate-200">{a.sensor_name}</td>
              <td className="px-3 py-2">
                <span className={`rounded px-2 py-0.5 text-xs ${typeBadge[a.alarm_type]}`}>
                  {a.alarm_type}
                </span>
              </td>
              <td className="px-3 py-2 text-slate-300">{a.threshold_value}</td>
              <td className="px-3 py-2 text-slate-300">{a.actual_value.toFixed(2)}</td>
              <td className="px-3 py-2 text-slate-400">{a.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
