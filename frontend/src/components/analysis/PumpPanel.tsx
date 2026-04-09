import { useState } from "react";
import { usePumpAnalysis, type PumpRequest } from "@/api/analysis";

interface Props {
  runId: string;
  sensors: string[];
}

const FIELDS: { key: keyof PumpRequest; label: string }[] = [
  { key: "pump_speed_sensor", label: "Pump speed (%)" },
  { key: "mea_level_sensor", label: "MEA level (%)" },
  { key: "flowrate_sensor", label: "Flowrate (kg/h)" },
];

export function PumpPanel({ runId, sensors }: Props) {
  const [body, setBody] = useState<PumpRequest>({
    pump_speed_sensor: sensors[0] ?? "",
    mea_level_sensor: sensors[1] ?? "",
    flowrate_sensor: sensors[2] ?? "",
  });
  const mut = usePumpAnalysis(runId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {FIELDS.map(({ key, label }) => (
          <label key={key} className="block text-sm">
            <span className="text-slate-400">{label}</span>
            <select
              value={body[key] as string}
              onChange={(e) => setBody({ ...body, [key]: e.target.value })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
            >
              {sensors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <button
        onClick={() => mut.mutate(body)}
        className="rounded-lg bg-accent px-4 py-2 text-slate-900 font-medium"
        disabled={mut.isPending}
      >
        {mut.isPending ? "Running…" : "Run analysis"}
      </button>
      {mut.isError && (
        <div className="text-sm text-red-400">Analysis failed — check the sensor mapping.</div>
      )}
      {mut.data && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Stat label="Safe speed" value={`${mut.data.safe_speed_pct.toFixed(1)} %`} />
            <Stat label="Predicted flow" value={`${mut.data.predicted_flow_kg_h.toFixed(0)} kg/h`} />
            <Stat label="Predicted level" value={`${mut.data.predicted_level_pct.toFixed(1)} %`} />
            <Stat label="Level-alarm speed" value={`${mut.data.level_alarm_speed_pct.toFixed(1)} %`} />
            <Stat label="Flow-alarm speed" value={`${mut.data.flow_alarm_speed_pct.toFixed(1)} %`} />
            <Stat label="Limiting" value={mut.data.limiting_constraint} />
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm">
            <div className="text-xs uppercase text-slate-500 mb-1">Fitted models</div>
            <pre className="text-slate-200 whitespace-pre-wrap">
              {JSON.stringify({ flow: mut.data.flow_model, level: mut.data.level_model }, null, 2)}
            </pre>
          </div>
          {mut.data.notes.length > 0 && (
            <ul className="list-disc pl-5 text-xs text-slate-400">
              {mut.data.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-3">
      <div className="text-xs uppercase text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-100">{value}</div>
    </div>
  );
}
