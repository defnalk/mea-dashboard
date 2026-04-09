import { useState } from "react";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useLatestReadings } from "@/api/readings";
import { EmptyState } from "@/components/common/EmptyState";
import { HeatExchangerPanel } from "@/components/analysis/HeatExchangerPanel";
import { PumpPanel } from "@/components/analysis/PumpPanel";
import { MassTransferPanel } from "@/components/analysis/MassTransferPanel";

const TABS = ["heat", "pump", "mass"] as const;
type Tab = (typeof TABS)[number];

const labels: Record<Tab, string> = {
  heat: "Heat exchanger",
  pump: "Pump",
  mass: "Mass transfer",
};

export default function AnalysisPage() {
  const runId = useDashboardStore((s) => s.selectedRunId);
  const { data: latest } = useLatestReadings(runId);
  const [tab, setTab] = useState<Tab>("heat");

  if (!runId) return <EmptyState title="No run selected" />;
  const sensors = latest?.map((l) => l.sensor_name) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Analysis</h1>
      <div className="flex gap-1 border-b border-slate-700">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm ${
              tab === t
                ? "border-b-2 border-accent text-accent"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {labels[t]}
          </button>
        ))}
      </div>
      {tab === "heat" && <HeatExchangerPanel runId={runId} sensors={sensors} />}
      {tab === "pump" && <PumpPanel runId={runId} sensors={sensors} />}
      {tab === "mass" && <MassTransferPanel runId={runId} sensors={sensors} />}
    </div>
  );
}
