import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { AlarmEvent, AlarmStats } from "@/types";

export function useAlarms(runId: string | null) {
  return useQuery({
    queryKey: ["alarms", runId],
    enabled: !!runId,
    queryFn: async (): Promise<AlarmEvent[]> => {
      const r = await apiClient.get<AlarmEvent[]>(`/runs/${runId}/alarms`);
      return r.data;
    },
  });
}

export function useAlarmStats(runId: string | null) {
  return useQuery({
    queryKey: ["alarms", runId, "stats"],
    enabled: !!runId,
    queryFn: async (): Promise<AlarmStats> => {
      const r = await apiClient.get<AlarmStats>(`/runs/${runId}/alarms/stats`);
      return r.data;
    },
  });
}
