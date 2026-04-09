import { useDashboardStore } from "@/stores/dashboardStore";
import { REFRESH_INTERVAL_MS } from "@/utils/constants";

export function useAutoRefreshInterval(): number | undefined {
  const enabled = useDashboardStore((s) => s.autoRefresh);
  return enabled ? REFRESH_INTERVAL_MS : undefined;
}
