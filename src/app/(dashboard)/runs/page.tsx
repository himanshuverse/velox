"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  History,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RunStatusBadge } from "@/components/runs/run-status-badge";
import { RunTriggerBadge } from "@/components/runs/run-trigger-badge";
import {
  RunDetailsSheet,
  RunDetails,
} from "@/components/runs/run-details-sheet";
import { toast } from "sonner";

export interface RunListItem {
  id: string;
  workflowId: string;
  status: string;
  trigger: string;
  error: string | null;
  startedAt: string | Date;
  completedAt: string | Date | null;
  logs: unknown;
  workflow?: {
    id: string;
    name: string;
  };
}

export default function RunsPage() {
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "completed" | "failed" | "running" | "pending"
  >("all");
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [limit, setLimit] = useState<number>(50);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedRun, setSelectedRun] = useState<RunDetails | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // 1. Fetch Workflows for filter dropdown
  const workflowsQueryOpts = trpc.workflow.list.queryOptions();
  const { data: workflows = [] } = useQuery(workflowsQueryOpts);

  // 2. Fetch Runs list
  const runsQueryOpts = trpc.run.list.queryOptions({
    workflowId: selectedWorkflowId === "all" ? undefined : selectedWorkflowId,
    status: selectedStatus,
    limit,
  });
  const {
    data: runsData = [],
    isLoading,
    isFetching,
    refetch,
  } = useQuery(runsQueryOpts);

  const runs = (runsData ?? []) as unknown as RunListItem[];

  // 3. Fetch Aggregate Stats
  const statsQueryOpts = trpc.run.stats.queryOptions({
    workflowId: selectedWorkflowId === "all" ? undefined : selectedWorkflowId,
  });
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

  // 4. Delete Run Mutation
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

  // Auto-refresh interval (polling every 3.5s when enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      refetch();
    }, 3500);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  // Filter runs locally by search query
  const filteredRuns = runs.filter((run) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const workflowName = run.workflow?.name?.toLowerCase() || "";
    const runId = run.id.toLowerCase();
    const trigger = run.trigger?.toLowerCase() || "";
    return workflowName.includes(q) || runId.includes(q) || trigger.includes(q);
  });

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-inner">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-100">
                Run History & Logs
              </h1>
              <p className="text-xs md:text-sm text-neutral-400">
                Real-time execution log and diagnostics across all automated workflows.
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`border-neutral-800 text-xs gap-1.5 transition-colors ${
              autoRefresh
                ? "bg-orange-500/10 text-orange-400 border-orange-500/30"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                autoRefresh ? "bg-orange-400 animate-pulse" : "bg-neutral-600"
              }`}
            />
            {autoRefresh ? "Live Auto-Refresh" : "Auto-Refresh Off"}
          </Button>

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
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Total Runs</span>
            <Layers className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-neutral-100">
            {stats?.total ?? 0}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">Recorded executions</p>
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
            {stats?.completed ?? 0} successful runs
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
          <p className="text-[11px] text-neutral-500 mt-1">Requires inspection</p>
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
          <p className="text-[11px] text-neutral-500 mt-1">Currently running</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search by workflow name, run ID, or trigger..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-neutral-900/60 border-neutral-800 text-neutral-200 placeholder:text-neutral-500 text-xs h-9"
          />
        </div>

        {/* Workflow Filter Dropdown */}
        <div className="w-full sm:w-52">
          <Select
            value={selectedWorkflowId}
            onValueChange={(val) => setSelectedWorkflowId(val)}
          >
            <SelectTrigger className="h-9 bg-neutral-900/60 border-neutral-800 text-neutral-200 text-xs">
              <SelectValue placeholder="All Workflows" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200 text-xs">
              <SelectItem value="all">All Workflows</SelectItem>
              {workflows.map((wf) => (
                <SelectItem key={wf.id} value={wf.id}>
                  {wf.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter Dropdown */}
        <div className="w-full sm:w-40">
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

        {/* Limit Dropdown */}
        <div className="w-full sm:w-32">
          <Select
            value={limit.toString()}
            onValueChange={(val) => setLimit(Number(val))}
          >
            <SelectTrigger className="h-9 bg-neutral-900/60 border-neutral-800 text-neutral-200 text-xs">
              <SelectValue placeholder="Page Size" />
            </SelectTrigger>
            <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200 text-xs">
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
              <SelectItem value="200">200 rows</SelectItem>
              <SelectItem value="500">500 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Runs Table / List */}
      <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-3" />
            <p className="text-xs text-neutral-400">Loading execution runs...</p>
          </div>
        ) : filteredRuns.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="h-12 w-12 rounded-xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center text-neutral-500 mb-3">
              <History className="h-6 w-6 stroke-1" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-200">
              No workflow runs found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              {searchQuery || selectedStatus !== "all" || selectedWorkflowId !== "all"
                ? "Try adjusting your search criteria or status filters."
                : "Trigger a workflow from the canvas editor or via webhook to see execution logs here."}
            </p>
            {workflows.length > 0 && (
              <Link href={`/workflows/${workflows[0].id}`} className="mt-4">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-500 text-xs gap-1.5">
                  <span>Open First Workflow</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div>
            {/* Sticky Table Header */}
            <div className="sticky top-0 z-10 grid grid-cols-12 gap-3 px-4 py-3 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              <div className="col-span-4 sm:col-span-3">Workflow</div>
              <div className="col-span-3 sm:col-span-2">Status</div>
              <div className="hidden sm:block sm:col-span-2">Trigger</div>
              <div className="hidden md:block md:col-span-2">Duration</div>
              <div className="col-span-3 sm:col-span-3 md:col-span-2">Started</div>
              <div className="col-span-2 sm:col-span-2 md:col-span-1 text-right">
                Actions
              </div>
            </div>

            {/* Run Rows */}
            <div className="divide-y divide-neutral-800/60">
              {filteredRuns.map((run) => {
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
                    onClick={() => setSelectedRun(run as RunDetails)}
                    className="grid grid-cols-12 gap-3 px-4 py-3.5 items-center hover:bg-neutral-800/40 cursor-pointer transition-colors text-xs text-neutral-300 group"
                  >
                    {/* Workflow Name */}
                    <div className="col-span-4 sm:col-span-3 truncate">
                      <div className="flex items-center gap-1.5 truncate">
                        <Link
                          href={`/workflows/${run.workflowId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium text-neutral-200 group-hover:text-orange-400 hover:underline truncate transition-colors"
                        >
                          {run.workflow?.name || "Untitled Workflow"}
                        </Link>
                      </div>
                      <span className="font-mono text-[10px] text-neutral-500 truncate block">
                        {run.id.slice(0, 16)}...
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="col-span-3 sm:col-span-2">
                      <RunStatusBadge status={run.status} className="text-[10px] px-2" />
                    </div>

                    {/* Trigger Badge */}
                    <div className="hidden sm:block sm:col-span-2">
                      <RunTriggerBadge trigger={run.trigger} className="text-[10px]" />
                    </div>

                    {/* Duration & Steps */}
                    <div className="hidden md:block md:col-span-2 text-neutral-400 font-mono text-[11px]">
                      <div>{durationText}</div>
                      <span className="text-[10px] text-neutral-500">
                        {logs.length} step{logs.length === 1 ? "" : "s"}
                      </span>
                    </div>

                    {/* Started Time */}
                    <div className="col-span-3 sm:col-span-3 md:col-span-2 text-[11px] text-neutral-400">
                      <p className="truncate">{new Date(run.startedAt).toLocaleDateString()}</p>
                      <p className="text-[10px] text-neutral-500 truncate">
                        {new Date(run.startedAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 sm:col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRun(run as RunDetails);
                        }}
                        className="h-7 px-2 text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800 text-[11px]"
                        title="Inspect step logs"
                      >
                        Logs
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteRunMutation.mutate({ id: run.id });
                        }}
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

            {/* Table Footer with Count */}
            <div className="px-4 py-2.5 bg-neutral-900/60 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-between">
              <span>
                Showing {filteredRuns.length} of {runs.length} runs
              </span>
              <span className="text-[10px] font-mono text-neutral-600">
                Click any row to view step-by-step logs
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Slide-in Run Inspection Sheet */}
      <RunDetailsSheet
        run={selectedRun}
        isOpen={!!selectedRun}
        onClose={() => setSelectedRun(null)}
      />
    </div>
  );
}
