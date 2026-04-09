export function formatTimestamp(value: string | Date, withSeconds = false): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    day: "2-digit",
    month: "2-digit",
  });
}

export function formatSensorValue(value: number, unit: string, precision = 2): string {
  return `${value.toFixed(precision)} ${unit}`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
