export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:8000/api/v1";

export const REFRESH_INTERVAL_MS = 5_000;

export const SENSOR_DISPLAY_NAMES: Record<string, string> = {
  TT101: "Absorber Inlet Temperature",
  TT102: "Absorber Outlet Temperature",
  TT103: "Utility Inlet Temperature",
  FT103: "MEA Flowrate",
  LT101: "MEA Tank Level",
  AT101: "CO₂ Outlet Concentration",
  PS_J100: "Pump J-100 Speed",
};

export const KEY_SENSORS = ["TT101", "TT102", "FT103", "LT101", "AT101", "PS_J100"];
