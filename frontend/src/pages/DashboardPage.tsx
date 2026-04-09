import { AlarmBanner } from "@/components/dashboard/AlarmBanner";
import { SensorGrid } from "@/components/dashboard/SensorGrid";
import { TimeSeriesChart } from "@/components/dashboard/TimeSeriesChart";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useDashboardStore } from "@/stores/dashboardStore";
import { useLatestReadings, useReadings } from "@/api/readings";
import { useAlarms } from "@/api/alarms";
import { useAutoRefreshInterval } from "@/hooks/useAutoRefresh";

export default function DashboardPage() {
  const { selectedRunId, selectedSensors, resolution } = useDashboardStore();
  const refetchMs = useAutoRefreshInterval();

  const latest = useLatestReadings(selectedRunId, refetchMs);
  const readings = useReadings(selectedRunId, selectedSensors, resolution);
  const alarms = useAlarms(selectedRunId);

  if (!selectedRunId) {
    return (
      <EmptyState
        title="No run selected"
        description="Pick a run from the sidebar or upload a CSV to get started."
      />
    );
  }

  if (latest.isLoading || readings.isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <AlarmBanner alarms={alarms.data ?? []} />
      <SensorGrid latest={latest.data ?? []} history={readings.data ?? []} />
      <TimeSeriesChart data={readings.data ?? []} />
    </div>
  );
}
