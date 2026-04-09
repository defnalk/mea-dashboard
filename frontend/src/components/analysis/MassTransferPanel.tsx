import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMassTransferAnalysis } from "@/api/analysis";

interface Props {
  runId: string;
  sensors: string[];
}

interface Row {
  sensor: string;
  height_m: number;
}

// Default sampling heights for the C100 absorber column (matches meapy.PlantGeometry).
const DEFAULT_HEIGHTS = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5];

export function MassTransferPanel({ runId, sensors }: Props) {
  const [rows, setRows] = useState<Row[]>(() =>
    sensors.slice(0, DEFAULT_HEIGHTS.length).map((s, i) => ({
      sensor: s,
      height_m: DEFAULT_HEIGHTS[i] ?? i,
    })),
  );
  const [inertFlow, setInertFlow] = useState(0.05);
  const mut = useMassTransferAnalysis(runId);

  const updateRow = (idx: number, patch: Partial<Row>) =>
    setRows(rows.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const addRow = () => setRows([...rows, { sensor: sensors[0] ?? "", height_m: 0 }]);
  const removeRow = (idx: number) => setRows(rows.filter((_, i) => i !== idx));

  const submit = () => {
    const sensors_by_height_m = Object.fromEntries(rows.map((r) => [r.sensor, r.height_m]));
    mut.mutate({ sensors_by_height_m, inert_gas_flow_mol_s: inertFlow });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="text-sm text-slate-400">Sensor → column height (m)</div>
        {rows.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <select
              value={row.sensor}
              onChange={(e) => updateRow(idx, { sensor: e.target.value })}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            >
              {sensors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              type="number"
              step="0.1"
              value={row.height_m}
              onChange={(e) => updateRow(idx, { height_m: Number(e.target.value) })}
              className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
            />
            <button
              onClick={() => removeRow(idx)}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={addRow}
          className="text-xs text-accent hover:text-accent-soft"
        >
          + Add sensor
        </button>
      </div>

      <label className="block text-sm">
        <span className="text-slate-400">Inert gas flow (mol/s)</span>
        <input
          type="number"
          step="0.01"
          value={inertFlow}
          onChange={(e) => setInertFlow(Number(e.target.value))}
          className="mt-1 w-40 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm"
        />
      </label>

      <button
        onClick={submit}
        className="rounded-lg bg-accent px-4 py-2 text-slate-900 font-medium"
        disabled={mut.isPending}
      >
        {mut.isPending ? "Running…" : "Run analysis"}
      </button>

      {mut.isError && (
        <div className="text-sm text-red-400">Analysis failed — check sensors and heights.</div>
      )}

      {mut.data && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="text-xs uppercase text-slate-500">
                NTU<sub>OG</sub>
              </div>
              <div className="text-2xl font-semibold text-slate-100">
                {mut.data.ntu_og.toFixed(2)}
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
              <div className="text-xs uppercase text-slate-500">
                H<sub>OG</sub>
              </div>
              <div className="text-2xl font-semibold text-slate-100">
                {mut.data.h_og.toFixed(2)} m
              </div>
            </div>
          </div>
          <div className="h-64 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mut.data.profile}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis
                  dataKey="height_m"
                  stroke="#64748b"
                  label={{ value: "Height (m)", fill: "#64748b" }}
                />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                />
                <Line
                  type="monotone"
                  dataKey="k_oga"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
