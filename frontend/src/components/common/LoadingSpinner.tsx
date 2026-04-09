export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-slate-400 text-sm">
      <span className="h-4 w-4 rounded-full border-2 border-slate-600 border-t-accent animate-spin" />
      {label ?? "Loading…"}
    </div>
  );
}
