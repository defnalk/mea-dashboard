export const SENSOR_COLORS: Record<string, string> = {
  TT101: "#ef4444",
  TT102: "#f97316",
  TT103: "#f59e0b",
  TT104: "#eab308",
  TT105: "#a3e635",
  TT106: "#84cc16",
  FT103: "#3b82f6",
  LT101: "#10b981",
  AT101: "#a855f7",
  PS_J100: "#ec4899",
};

export const colorFor = (sensor: string): string =>
  SENSOR_COLORS[sensor] ?? "#94a3b8";
