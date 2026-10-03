"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Play,
  History,
  RefreshCw,
  Layers,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RunStatusBadge } from "@/components/runs/run-status-badge";
import { RunTriggerBadge } from "@/components/runs/run-trigger-badge";
import {
  RunDetailsSheet,
  RunDetails,
} from "@/components/runs/run-details-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorkflowRunsPage({ params }: PageProps) {
  const { id: workflowId } = use(params);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "completed" | "failed" | "running" | "pending"
  >("all");
  const [selectedRun, setSelectedRun] = useState<RunDetails | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // 1. Fetch Workflow details
  const workflowQueryOpts = trpc.workflow.getById.queryOptions({ id: workflowId });
  const { data: workflow, isLoading: isWorkflowLoading } = useQuery(workflowQueryOpts);

  // 2. Fetch Runs for this workflow
  const runsQueryOpts = trpc.run.list.queryOptions({
    workflowId,
    status: selectedStatus,
    limit: 50,
  });
  const {
    data: runsData = [],
    isLoading: isRunsLoading,
    isFetching,
    refetch,
  } = useQuery(runsQueryOpts);

  const runs = (runsData ?? []) as unknown as RunDetails[];

  // 3. Fetch Stats for this workflow
  const statsQueryOpts = trpc.run.stats.queryOptions({ workflowId });
  const { data: statsData } = useQuery(statsQueryOpts);
  const stats = statsData as
    | {
        total: number;
        completed: number;
        failed: number;
        running: number;
        successRate: number;
      }
    | undefined;

  // 4. Trigger Run Mutation
  const triggerRunMutation = useMutation(
    trpc.workflow.triggerRun.mutationOptions({
      onSuccess: () => {
        toast.success("Workflow execution queued!");
        queryClient.invalidateQueries({
          queryKey: trpc.run.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.run.stats.queryKey(),
        });
      },
      onError: (err: { message: string }) => {
        toast.error(`Failed to trigger workflow: ${err.message}`);
      },
    })
  );

  // 5. Delete Run Mutation
  const deleteRunMutation = useMutation(
    trpc.run.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Run removed from history");
        queryClient.invalidateQueries({
          queryKey: trpc.run.list.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.run.stats.queryKey(),
        });
        if (selectedRun) setSelectedRun(null);
      },
      onError: (err: { message: string }) => {
        toast.error(`Failed to delete run: ${err.message}`);
      },
    })
  );

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-6xl mx-auto w-full">
      {/* Top Navigation & Workflow Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href={`/workflows/${workflowId}`}
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-orange-400 transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Canvas Editor</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100 flex items-center gap-2">
                <span>{workflow?.name || "Workflow"} Runs</span>
              </h1>
              <p className="text-xs text-neutral-400">
                Detailed run history, outputs, and node timings for this workflow.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 text-xs gap-1.5"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-orange-400" : ""}`}
            />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => triggerRunMutation.mutate({ id: workflowId })}
            disabled={triggerRunMutation.isPending}
            className="bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5 shadow-lg shadow-orange-600/20"
          >
            {triggerRunMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            Run Now
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Workflow Runs</span>
            <Layers className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-100">
            {stats?.total ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Total executions</p>
        </div>

        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Success Rate</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {stats?.successRate ?? 100}%
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            {stats?.completed ?? 0} completed
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Failed</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            {stats?.failed ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Error runs</p>
        </div>

        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">In Progress</span>
            <Loader2
              className={`h-4 w-4 text-amber-400 ${
                (stats?.running ?? 0) > 0 ? "animate-spin" : ""
              }`}
            />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {stats?.running ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Active executions</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="w-48">
          <Select
            value={selectedStatus}
            onValueChange={(val) =>
              setSelectedStatus(
                val as "all" | "completed" | "failed" | "running" | "pending"
              )
            }
          >
            <SelectTrigger className="h-9 bg-neutral-900/60 border-neutral-800 text-neutral-200 text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200 text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Link
          href={`/workflows/${workflowId}`}
          className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
        >
          <span>Open Canvas Editor</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Runs Table */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden shadow-xl">
        {isRunsLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
            <p className="text-xs text-neutral-400">Loading runs...</p>
          </div>
        ) : runs.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <History className="h-8 w-8 text-neutral-500 mb-2 stroke-1" />
            <h3 className="text-sm font-semibold text-neutral-200">
              No executions found for this workflow
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Click &quot;Run Now&quot; above to execute this workflow and inspect its logs.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/70">
            {/* Header */}
            <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-neutral-900/80 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              <div className="col-span-3">Status</div>
              <div className="col-span-2">Trigger</div>
              <div className="col-span-3">Duration & Steps</div>
              <div className="col-span-3">Executed At</div>
              <div className="col-span-1 text-right">Inspect</div>
            </div>

            {/* Rows */}
            {runs.map((run) => {
              const logs = Array.isArray(run.logs) ? run.logs : [];
              const start = new Date(run.startedAt).getTime();
              const end = run.completedAt
                ? new Date(run.completedAt).getTime()
                : Date.now();
              const durationMs = Math.max(0, end - start);
              const durationText =
                durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`;

              return (
                <div
                  key={run.id}
                  className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center hover:bg-neutral-800/30 transition-colors text-xs text-neutral-300"
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <RunStatusBadge status={run.status} className="text-[10px] px-2" />
                  </div>

                  <div className="col-span-2">
                    <RunTriggerBadge trigger={run.trigger} className="text-[10px]" />
                  </div>

                  <div className="col-span-3 text-neutral-400 font-mono text-[11px]">
                    <div>{durationText}</div>
                    <span className="text-[10px] text-neutral-500">
                      {logs.length} step{logs.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="col-span-3 text-[11px] text-neutral-400">
                    <p className="truncate">{new Date(run.startedAt).toLocaleDateString()}</p>
                    <p className="text-[10px] text-neutral-500 truncate">
                      {new Date(run.startedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setSelectedRun({
                          ...run,
                          workflow: workflow
                            ? { id: workflow.id, name: workflow.name }
                            : undefined,
                        } as RunDetails)
                      }
                      className="h-7 px-2 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 text-[11px]"
                    >
                      Inspect
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRunMutation.mutate({ id: run.id })}
                      className="h-7 w-7 text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete run"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Run Inspection Sheet */}
      <RunDetailsSheet
        run={selectedRun}
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
      />
    </div>
  );
}
