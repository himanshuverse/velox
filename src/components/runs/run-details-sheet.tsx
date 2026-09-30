"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RunStatusBadge } from "./run-status-badge";
import { RunTriggerBadge } from "./run-trigger-badge";
import {
  ExternalLink,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Terminal,
  Layers,
  Zap,
} from "lucide-react";

export interface RunLogEntry {
  nodeId: string;
  nodeLabel: string;
  subtype: string;
  status: "running" | "success" | "failed" | "skipped";
  output?: unknown;
  error?: string;
  durationMs: number;
  executedAt: string;
}

export interface RunDetails {
  id: string;
  workflowId: string;
  status: string;
  trigger?: string | null;
  error?: string | null;
  startedAt: string | Date;
  completedAt?: string | Date | null;
  logs: unknown;
  workflow?: {
    id: string;
    name: string;
    description?: string | null;
  };
}

interface RunDetailsSheetProps {
  run: RunDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RunDetailsSheet({ run, isOpen, onClose }: RunDetailsSheetProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  if (!run) return null;

  const logs = Array.isArray(run.logs) ? (run.logs as RunLogEntry[]) : [];

  const handleCopyId = () => {
    navigator.clipboard.writeText(run.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyStepOutput = (stepId: string, output: unknown) => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  // Calculate total duration
  const start = new Date(run.startedAt).getTime();
  const end = run.completedAt ? new Date(run.completedAt).getTime() : Date.now();
  const totalDurationMs = Math.max(0, end - start);
  const durationText =
    totalDurationMs < 1000
      ? `${totalDurationMs}ms`
      : `${(totalDurationMs / 1000).toFixed(2)}s`;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        className="w-full sm:max-w-xl md:max-w-2xl bg-neutral-950 border-neutral-800 text-neutral-100 p-0 flex flex-col h-full shadow-2xl"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-neutral-800/80 bg-neutral-900/40">
          <SheetHeader className="text-left space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <RunStatusBadge status={run.status} />
                <RunTriggerBadge trigger={run.trigger} />
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <Clock className="h-3.5 w-3.5 text-neutral-500" />
                <span>{durationText}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-lg font-semibold text-neutral-100 truncate">
                  {run.workflow?.name || "Workflow Run"}
                </SheetTitle>
                {run.workflow && (
                  <Link
                    href={`/workflows/${run.workflow.id}`}
                    className="inline-flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    title="Open in workflow editor"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <SheetDescription className="text-xs text-neutral-400 mt-1 flex items-center gap-2">
                <span className="font-mono text-neutral-500 truncate max-w-[280px]">
                  Run ID: {run.id}
                </span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:text-neutral-200 text-neutral-500 transition-colors rounded"
                  title="Copy Run ID"
                >
                  {copiedId ? (
                    <Check className="h-3 w-3 text-emerald-400" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-neutral-800/60 text-xs">
            <div>
              <p className="text-neutral-500 text-[11px]">Started At</p>
              <p className="text-neutral-300 font-medium mt-0.5 truncate">
                {new Date(run.startedAt).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-[11px]">Completed At</p>
              <p className="text-neutral-300 font-medium mt-0.5 truncate">
                {run.completedAt
                  ? new Date(run.completedAt).toLocaleTimeString()
                  : "In progress"}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-[11px]">Total Steps</p>
              <p className="text-neutral-300 font-medium mt-0.5">
                {logs.length} executed
              </p>
            </div>
          </div>
        </div>

        {/* Global Error Banner if failed */}
        {run.error && (
          <div className="mx-6 mt-4 p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="overflow-hidden">
              <span className="font-semibold block text-rose-200">Execution Error:</span>
              <p className="font-mono text-[11px] mt-1 break-words">{run.error}</p>
            </div>
          </div>
        )}

        {/* Step-by-Step Logs Section */}
        <div className="flex-1 flex flex-col min-h-0 px-6 py-4">
          <div className="flex items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-orange-400" />
              <h3 className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                Step-by-Step Execution
              </h3>
            </div>
            <span className="text-[11px] text-neutral-500">
              {logs.filter((l) => l.status === "success").length} succeeded,{" "}
              {logs.filter((l) => l.status === "failed").length} failed
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                <Terminal className="h-8 w-8 mb-2 stroke-1" />
                <p className="text-xs font-medium">No execution steps logged yet</p>
                <p className="text-[11px] text-neutral-600 mt-1">
                  Steps will appear as nodes are executed by Inngest.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-6">
                {logs.map((step, idx) => {
                  const isExpanded = !!expandedSteps[step.nodeId];
                  const hasOutput =
                    step.output !== undefined && step.output !== null;

                  return (
                    <div
                      key={`${step.nodeId}-${idx}`}
                      className="rounded-lg border border-neutral-800 bg-neutral-900/60 overflow-hidden transition-all duration-150"
                    >
                      {/* Step Summary Row */}
                      <button
                        type="button"
                        onClick={() => toggleStep(step.nodeId)}
                        className="w-full flex items-center justify-between p-3 text-left hover:bg-neutral-800/40 transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-[10px] font-mono text-neutral-400 border border-neutral-700">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-neutral-200 truncate">
                                {step.nodeLabel || step.nodeId}
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 border-neutral-700 bg-neutral-800/60 text-neutral-400 capitalize"
                              >
                                {step.subtype.replace("_", " ")}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-neutral-500 font-mono">
                              {step.durationMs}ms
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <RunStatusBadge
                            status={step.status}
                            className="text-[10px] px-2 py-0.5"
                          />
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-neutral-500" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-neutral-500" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content: Error or Payload */}
                      {isExpanded && (
                        <div className="border-t border-neutral-800/80 p-3 bg-neutral-950/80 space-y-2.5">
                          {step.error && (
                            <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono break-words">
                              <span className="text-[10px] font-semibold uppercase block text-rose-400">
                                Node Error:
                              </span>
                              {step.error}
                            </div>
                          )}

                          {hasOutput ? (
                            <div>
                              <div className="flex items-center justify-between pb-1.5">
                                <span className="text-[10px] uppercase font-mono text-neutral-400">
                                  Output Payload
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopyStepOutput(step.nodeId, step.output)
                                  }
                                  className="text-[10px] text-orange-400 hover:text-orange-300 flex items-center gap-1"
                                >
                                  {copiedStep === step.nodeId ? (
                                    <>
                                      <Check className="h-3 w-3 text-emerald-400" />
                                      <span>Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="h-3 w-3" />
                                      <span>Copy JSON</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-2.5 rounded bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-48 scrollbar-thin">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-[11px] text-neutral-500 italic">
                              No output generated for this step.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/30 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100 text-xs"
          >
            Close
          </Button>

          {run.workflow && (
            <Link href={`/workflows/${run.workflow.id}`}>
              <Button
                size="sm"
                className="bg-orange-600 hover:bg-orange-500 text-white text-xs gap-1.5 shadow-lg shadow-orange-600/20"
              >
                <span>Edit Workflow</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
