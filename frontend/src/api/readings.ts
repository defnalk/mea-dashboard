import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { LatestReading, ReadingPoint, Resolution } from "@/types";

export function useReadings(
  runId: string | null,
  sensors: string[],
  resolution: Resolution = "raw",
) {
  return useQuery({
    queryKey: ["readings", runId, sensors, resolution],
    enabled: !!runId && sensors.length > 0,
    queryFn: async (): Promise<ReadingPoint[]> => {
      const params = new URLSearchParams();
      sensors.forEach((s) => params.append("sensor", s));
      params.set("resolution", resolution);
      const r = await apiClient.get<ReadingPoint[]>(
        `/runs/${runId}/readings?${params.toString()}`,
      );
      return r.data;
    },
  });
}

export function useLatestReadings(runId: string | null, refetchMs?: number) {
  return useQuery({
    queryKey: ["readings", runId, "latest"],
    enabled: !!runId,
    refetchInterval: refetchMs,
    queryFn: async (): Promise<LatestReading[]> => {
      const r = await apiClient.get<LatestReading[]>(`/runs/${runId}/readings/latest`);
      return r.data;
    },
  });
}
