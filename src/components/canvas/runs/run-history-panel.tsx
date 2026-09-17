"use client";

import { useState } from "react";
import {
  X,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Play,
  Terminal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

interface RunHistoryPanelProps {
  workflowId: string;
  isOpen: boolean;
  onClose: () => void;
  onTriggerRun?: () => void;
  isTriggering?: boolean;
}

export function RunHistoryPanel({
  workflowId,
  isOpen,
  onClose,
  onTriggerRun,
  isTriggering,
}: RunHistoryPanelProps) {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const trpc = useTRPC();

  const queryOpts = trpc.workflow.getRuns.queryOptions({ id: workflowId });
  const { data: runsData, isLoading, refetch, isFetching } = useQuery(queryOpts);
  const runs = runsData as Array<{
    id: string;
    status: string;
    startedAt: string | Date;
    completedAt: string | Date | null;
    logs: unknown;
  }> | undefined;

  if (!isOpen) return null;

  const toggleNodeExpanded = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const selectedRun = runs?.find((r) => r.id === selectedRunId) ?? runs?.[0];

  return (
    <aside className="relative flex h-full min-h-0 w-80 sm:w-96 shrink-0 flex-col border-l border-neutral-800/80 bg-[#151922]/95 backdrop-blur-md z-20 shadow-2xl overflow-hidden animate-in slide-in-from-right-10 duration-200">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800/80 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <History className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-100">Run History</h2>
            <p className="text-[10px] text-neutral-400">
              {runs ? `${runs.length} execution${runs.length === 1 ? "" : "s"}` : "Loading..."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            className="h-7 w-7 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
            title="Refresh runs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-orange-400" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center p-8 text-neutral-500 text-xs gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
            Loading runs...
          </div>
        ) : !runs || runs.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-500 mb-3">
              <Play className="h-5 w-5" />
            </div>
            <h3 className="text-xs font-medium text-neutral-300">No runs yet</h3>
            <p className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">
              Execute your workflow using the Run button in the header or via webhook.
            </p>
            {onTriggerRun && (
              <Button
                size="sm"
                onClick={onTriggerRun}
                disabled={isTriggering}
                className="mt-4 bg-orange-600 hover:bg-orange-500 text-white text-xs h-8 gap-1.5"
              >
                {isTriggering ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Play className="h-3 w-3 fill-current" />
                )}
                Run Now
              </Button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {/* Run Selection Pills / List */}
            <div className="p-3 bg-neutral-900/40 border-b border-neutral-800/80">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2 block">
                Recent Executions
              </span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {runs.map((run: any) => {
                  const isSelected = (selectedRun?.id === run.id);
                  return (
                    <button
                      key={run.id}
                      onClick={() => setSelectedRunId(run.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono shrink-0 transition-all ${
                        isSelected
                          ? "bg-neutral-800 border-orange-500/50 text-neutral-100 shadow-sm"
                          : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      {run.status === "completed" && (
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                      )}
                      {run.status === "failed" && (
                        <XCircle className="h-3 w-3 text-rose-400 shrink-0" />
                      )}
                      {(run.status === "running" || run.status === "pending") && (
                        <Loader2 className="h-3 w-3 text-amber-400 animate-spin shrink-0" />
                      )}
                      <span>
                        {new Date(run.startedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Run Details */}
            {selectedRun && (
              <div className="p-4 space-y-4">
                {/* Run Metadata Card */}
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-neutral-500 uppercase">Status</span>
                      <Badge
                        className={
                          selectedRun.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]"
                            : selectedRun.status === "failed"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]"
                        }
                      >
                        {selectedRun.status}
                      </Badge>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-500">
                      ID: {selectedRun.id.slice(-6)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/60 text-[11px]">
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Started</span>
                      <span className="text-neutral-300 font-mono">
                        {new Date(selectedRun.startedAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px]">Duration</span>
                      <span className="text-neutral-300 font-mono">
                        {selectedRun.completedAt
                          ? `${(
                              (new Date(selectedRun.completedAt).getTime() -
                                new Date(selectedRun.startedAt).getTime()) /
                              1000
                            ).toFixed(2)}s`
                          : "In progress..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step Logs Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Execution Steps
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {(selectedRun.logs as any[])?.length ?? 0} logged
                    </span>
                  </div>

                  {(!selectedRun.logs || (selectedRun.logs as any[]).length === 0) ? (
                    <div className="p-4 rounded-lg border border-neutral-800/80 bg-neutral-900/30 text-center text-xs text-neutral-500">
                      No step logs available yet.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(selectedRun.logs as any[]).map((log: any, idx: number) => {
                        const isExpanded = !!expandedNodes[log.nodeId ?? idx];

                        return (
                          <div
                            key={log.nodeId ?? idx}
                            className="rounded-lg border border-neutral-800/80 bg-neutral-900/50 overflow-hidden text-xs transition-colors"
                          >
                            {/* Step Header */}
                            <button
                              type="button"
                              onClick={() => toggleNodeExpanded(log.nodeId ?? idx)}
                              className="w-full flex items-center justify-between p-2.5 hover:bg-neutral-800/40 text-left transition-colors"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                {log.status === "success" && (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                )}
                                {log.status === "failed" && (
                                  <XCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                )}
                                {log.status === "skipped" && (
                                  <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                                )}

                                <span className="font-medium text-neutral-200 truncate">
                                  {log.nodeLabel || log.subtype || log.nodeId}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {typeof log.durationMs === "number" && (
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    {log.durationMs}ms
                                  </span>
                                )}
                                {isExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                                )}
                              </div>
                            </button>

                            {/* Step Expanded Content */}
                            {isExpanded && (
                              <div className="border-t border-neutral-800/80 p-2.5 bg-[#0e1117] space-y-2 font-mono">
                                {log.error && (
                                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] leading-relaxed">
                                    <span className="font-semibold block mb-0.5">Error:</span>
                                    {log.error}
                                  </div>
                                )}

                                <div>
                                  <div className="flex items-center gap-1 text-[10px] text-neutral-500 uppercase tracking-wider mb-1">
                                    <Terminal className="h-3 w-3" /> Output Payload
                                  </div>
                                  <pre className="p-2 rounded bg-black/40 border border-neutral-800 text-[10px] text-emerald-400/90 overflow-x-auto max-h-48 scrollbar-thin">
                                    {JSON.stringify(log.output ?? null, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
