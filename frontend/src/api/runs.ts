import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import type { PlantRun } from "@/types";

export const runsKeys = {
  all: ["runs"] as const,
  detail: (id: string) => ["runs", id] as const,
};

export function useRuns() {
  return useQuery({
    queryKey: runsKeys.all,
    queryFn: async (): Promise<PlantRun[]> => {
      const r = await apiClient.get<PlantRun[]>("/runs");
      return r.data;
    },
  });
}

export function useRun(runId: string | null) {
  return useQuery({
    queryKey: runId ? runsKeys.detail(runId) : ["runs", "none"],
    queryFn: async (): Promise<PlantRun> => {
      const r = await apiClient.get<PlantRun>(`/runs/${runId}`);
      return r.data;
    },
    enabled: !!runId,
  });
}

export interface UploadVars {
  file: File;
  name: string;
  description?: string;
  onProgress?: (pct: number) => void;
}

export function useUploadRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, name, description, onProgress }: UploadVars): Promise<PlantRun> => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name);
      if (description) fd.append("description", description);
      const r = await apiClient.post<PlantRun>("/runs/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (onProgress && e.total) onProgress(Math.round((100 * e.loaded) / e.total));
        },
      });
      return r.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: runsKeys.all }),
  });
}

export function useDeleteRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (runId: string): Promise<void> => {
      await apiClient.delete(`/runs/${runId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: runsKeys.all }),
  });
}
