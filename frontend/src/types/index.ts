export interface PlantRun {
  id: string;
  name: string;
  description: string | null;
  uploaded_at: string;
  start_time: string | null;
  end_time: string | null;
  reading_count: number;
  alarm_count: number;
}

export interface ReadingPoint {
  timestamp: string;
  sensor_name: string;
  value: number;
  unit: string;
}

export interface LatestReading {
  sensor_name: string;
  timestamp: string;
  value: number;
  unit: string;
}

export interface AlarmEvent {
  id: string;
  run_id: string;
  sensor_name: string;
  alarm_type: "HIGH" | "LOW" | "RATE_OF_CHANGE";
  threshold_value: number;
  actual_value: number;
  triggered_at: string;
  message: string;
}

export interface AlarmStats {
  total: number;
  by_sensor: Record<string, number>;
  by_type: Record<string, number>;
}

export type Resolution = "raw" | "1min" | "5min" | "15min";
