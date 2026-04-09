import { create } from "zustand";
import type { Resolution } from "@/types";
import { KEY_SENSORS } from "@/utils/constants";

interface DashboardState {
  selectedRunId: string | null;
  selectedSensors: string[];
  resolution: Resolution;
  autoRefresh: boolean;
  setSelectedRunId: (id: string | null) => void;
  toggleSensor: (sensor: string) => void;
  setResolution: (r: Resolution) => void;
  setAutoRefresh: (value: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedRunId: null,
  selectedSensors: KEY_SENSORS,
  resolution: "raw",
  autoRefresh: false,
  setSelectedRunId: (id) => set({ selectedRunId: id }),
  toggleSensor: (sensor) =>
    set((state) => ({
      selectedSensors: state.selectedSensors.includes(sensor)
        ? state.selectedSensors.filter((s) => s !== sensor)
        : [...state.selectedSensors, sensor],
    })),
  setResolution: (resolution) => set({ resolution }),
  setAutoRefresh: (autoRefresh) => set({ autoRefresh }),
}));
