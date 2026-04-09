type Status = "normal" | "warning" | "alarm";

const styles: Record<Status, string> = {
  normal: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  alarm: "bg-red-500/10 text-red-400 border-red-500/30",
};

const labels: Record<Status, string> = {
  normal: "Normal",
  warning: "Warning",
  alarm: "Alarm",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
