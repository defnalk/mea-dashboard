import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteRun, useRuns } from "@/api/runs";
import { useDashboardStore } from "@/stores/dashboardStore";
import { UploadModal } from "@/components/upload/UploadModal";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { formatTimestamp, formatDuration } from "@/utils/formatters";

export default function RunsListPage() {
  const { data, isLoading } = useRuns();
  const del = useDeleteRun();
  const setSelected = useDashboardStore((s) => s.setSelectedRunId);
  const navigate = useNavigate();
  const [uploadOpen, setUploadOpen] = useState(false);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Plant runs</h1>
        <button
          onClick={() => setUploadOpen(true)}
          className="rounded-lg bg-accent px-4 py-2 text-slate-900 font-medium"
        >
          Upload new run
        </button>
      </div>

      {!data?.length ? (
        <EmptyState
          title="No runs yet"
          description="Upload a CSV to ingest sensor data."
          action={
            <button
              onClick={() => setUploadOpen(true)}
              className="rounded-lg bg-accent px-4 py-2 text-slate-900 font-medium"
            >
              Upload CSV
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700 text-sm">
            <thead className="bg-slate-800/60 text-left text-xs uppercase text-slate-400">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Uploaded</th>
                <th className="px-3 py-2">Readings</th>
                <th className="px-3 py-2">Alarms</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.map((run) => {
                const duration =
                  run.start_time && run.end_time
                    ? (new Date(run.end_time).getTime() - new Date(run.start_time).getTime()) / 1000
                    : null;
                return (
                  <tr
                    key={run.id}
                    onClick={() => {
                      setSelected(run.id);
                      navigate("/");
                    }}
                    className="cursor-pointer hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-2 font-medium text-slate-200">{run.name}</td>
                    <td className="px-3 py-2 text-slate-400">{formatTimestamp(run.uploaded_at)}</td>
                    <td className="px-3 py-2 text-slate-300">{run.reading_count}</td>
                    <td
                      className={`px-3 py-2 ${run.alarm_count ? "text-red-400" : "text-emerald-400"}`}
                    >
                      {run.alarm_count}
                    </td>
                    <td className="px-3 py-2 text-slate-300">{formatDuration(duration)}</td>
                    <td className="px-3 py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          del.mutate(run.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </div>
  );
}
