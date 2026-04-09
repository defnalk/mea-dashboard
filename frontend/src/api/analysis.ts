import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./client";

export interface HeatExchangerRequest {
  mea_flow_sensor: string;
  t_mea_in_sensor: string;
  t_mea_out_sensor: string;
  utility_flow_sensor: string;
  t_utility_in_sensor: string;
  t_utility_out_sensor: string;
  area_m2?: number;
  flow_direction?: string;
}

export interface HeatExchangerResult {
  q_hot_w: number;
  q_cold_w: number;
  q_loss_w: number;
  lmtd_k: number;
  u_w_m2_k: number;
  u_kw_m2_k: number;
  efficiency: number;
  effectiveness: number;
  ntu: number;
}

export interface PumpRequest {
  pump_speed_sensor: string;
  mea_level_sensor: string;
  flowrate_sensor: string;
  level_alarm_pct?: number;
  flow_alarm_kg_h?: number;
}

export interface PumpResult {
  safe_speed_pct: number;
  predicted_level_pct: number;
  predicted_flow_kg_h: number;
  level_alarm_speed_pct: number;
  flow_alarm_speed_pct: number;
  limiting_constraint: string;
  notes: string[];
  flow_model: Record<string, number>;
  level_model: Record<string, number>;
}

export interface MassTransferRequest {
  sensors_by_height_m: Record<string, number>;
  inert_gas_flow_mol_s: number;
}

export interface MassTransferResult {
  profile: { height_m: number; k_oga: number }[];
  ntu_og: number;
  h_og: number;
}

export function useHeatExchangerAnalysis(runId: string | null) {
  return useMutation({
    mutationFn: async (body: HeatExchangerRequest): Promise<HeatExchangerResult> => {
      const r = await apiClient.post<HeatExchangerResult>(
        `/runs/${runId}/analysis/heat-exchanger`,
        body,
      );
      return r.data;
    },
  });
}

export function usePumpAnalysis(runId: string | null) {
  return useMutation({
    mutationFn: async (body: PumpRequest): Promise<PumpResult> => {
      const r = await apiClient.post<PumpResult>(`/runs/${runId}/analysis/pump`, body);
      return r.data;
    },
  });
}

export function useMassTransferAnalysis(runId: string | null) {
  return useMutation({
    mutationFn: async (body: MassTransferRequest): Promise<MassTransferResult> => {
      const r = await apiClient.post<MassTransferResult>(
        `/runs/${runId}/analysis/mass-transfer`,
        body,
      );
      return r.data;
    },
  });
}
