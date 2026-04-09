import { SensorCard, type SensorStatus } from "./SensorCard";
import type { LatestReading, ReadingPoint } from "@/types";
import { KEY_SENSORS } from "@/utils/constants";

interface Props {
  latest: LatestReading[];
  history: ReadingPoint[];
}

// Naive status: real thresholds live in the backend; this is a UX cue.
function statusFor(sensor: string, value: number): SensorStatus {
  if (sensor === "LT101" && (value < 15 || value > 85)) return "alarm";
  if (sensor.startsWith("TT") && value > 120) return "alarm";
  if (sensor === "FT103" && (value < 50 || value > 1000)) return "alarm";
  if (sensor === "AT101" && value > 15) return "alarm";
  if (sensor === "LT101" && (value < 20 || value > 80)) return "warning";
  if (sensor.startsWith("TT") && value > 110) return "warning";
  return "normal";
}

export function SensorGrid({ latest, history }: Props) {
  const latestBySensor = new Map(latest.map((l) => [l.sensor_name, l]));
  const historyBySensor = new Map<string, { value: number }[]>();
  for (const point of history) {
    if (!historyBySensor.has(point.sensor_name)) historyBySensor.set(point.sensor_name, []);
    historyBySensor.get(point.sensor_name)!.push({ value: point.value });
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {KEY_SENSORS.map((sensor) => {
        const l = latestBySensor.get(sensor);
        const value = l?.value ?? null;
        const status = value !== null ? statusFor(sensor, value) : "normal";
        return (
          <SensorCard
            key={sensor}
            sensor={sensor}
            value={value}
            unit={l?.unit ?? ""}
            history={historyBySensor.get(sensor) ?? []}
            status={status}
          />
        );
      })}
    </div>
  );
}
