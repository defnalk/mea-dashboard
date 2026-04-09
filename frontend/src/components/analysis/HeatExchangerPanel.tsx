import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useHeatExchangerAnalysis, type HeatExchangerRequest } from "@/api/analysis";

interface Props {
  runId: string;
  sensors: string[];
}

const FIELDS: { key: keyof HeatExchangerRequest; label: string }[] = [
  { key: "mea_flow_sensor", label: "MEA flow" },
  { key: "t_mea_in_sensor", label: "MEA inlet temp" },
  { key: "t_mea_out_sensor", label: "MEA outlet temp" },
  { key: "utility_flow_sensor", label: "Utility flow" },
  { key: "t_utility_in_sensor", label: "Utility inlet temp" },
  { key: "t_utility_out_sensor", label: "Utility outlet temp" },
];

export function HeatExchangerPanel({ runId, sensors }: Props) {
  const [body, setBody] = useState<HeatExchangerRequest>({
    mea_flow_sensor: sensors[0] ?? "",
    t_mea_in_sensor: sensors[1] ?? "",
    t_mea_out_sensor: sensors[2] ?? "",
    utility_flow_sensor: sensors[3] ?? "",
    t_utility_in_sensor: sensors[4] ?? "",
    t_utility_out_sensor: sensors[5] ?? "",
  });
  const mut = useHeatExchangerAnalysis(runId);

  const chartData = mut.data
    ? [
        { name: "U (kW/m²·K)", value: mut.data.u_kw_m2_k },
        { name: "LMTD (K)", value: mut.data.lmtd_k },
        { name: "Efficiency", value: mut.data.efficiency },
        { name: "Effectiveness", value: mut.data.effectiveness },
        { name: "NTU", value: mut.data.ntu },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4 text-sm">
            <pre className="text-slate-200 whitespace-pre-wrap">
              {JSON.stringify(mut.data, null, 2)}
            </pre>
          </div>
          <div className="h-64 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                <Bar dataKey="value" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
