import { useState } from "react";
import { Link } from "react-router-dom";
import type { AlarmEvent } from "@/types";

interface Props {
  alarms: AlarmEvent[];
}

export function AlarmBanner({ alarms }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || alarms.length === 0) return null;
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-200">
      <div>
        <span className="font-semibold">{alarms.length} active alarms</span> on this run.{" "}
        <Link to="/alarms" className="underline">
          View all
        </Link>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-red-300 hover:text-white text-sm"
      >
        Dismiss
      </button>
    </div>
  );
}
