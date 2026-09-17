"use client";

import { Check, Loader2, X, Minus } from "lucide-react";

export type ExecutionNodeStatus = "running" | "success" | "failed" | "skipped" | "idle";

export function getNodeStatusStyles(
  status?: string,
  selected?: boolean
): string {
  if (status === "running") {
    return "border-amber-400 bg-[#2a2214] ring-4 ring-amber-500/40 shadow-xl shadow-amber-500/30 animate-node-running scale-105";
  }
  if (status === "success") {
    return "border-emerald-500 bg-[#13271d] ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/30 animate-node-success";
  }
  if (status === "failed") {
    return "border-rose-500 bg-[#2a141b] ring-4 ring-rose-500/40 shadow-xl shadow-rose-500/40";
  }
  if (selected) {
    return "border-orange-500 bg-[#262c38] shadow-lg shadow-orange-950/50 ring-2 ring-orange-500/40 scale-105";
  }
  return "border-[#373f50] bg-[#202530] hover:border-[#4f5b72] hover:bg-[#252b37] shadow-md";
}

export function NodeStatusBadge({ status }: { status?: string }) {
  if (!status || status === "idle") return null;

  if (status === "running") {
    return (
      <>
        {/* Animated outer halo ring */}
        <span className="absolute -inset-1.5 rounded-[24px] border-2 border-amber-400/60 animate-ping pointer-events-none opacity-40" />
        <div
          className="absolute -top-2.5 -right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-black shadow-lg shadow-amber-500/60 animate-in zoom-in-75"
          title="Executing now..."
        >
          <Loader2 className="h-3.5 w-3.5 animate-spin stroke-[3]" />
        </div>
      </>
    );
  }

  if (status === "success") {
    return (
      <div
        className="absolute -top-2.5 -right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-black shadow-lg shadow-emerald-500/60 animate-in zoom-in-75"
        title="Execution successful"
      >
        <Check className="h-3.5 w-3.5 stroke-[3.5]" />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div
        className="absolute -top-2.5 -right-2.5 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/60 animate-in zoom-in-75"
        title="Execution failed"
      >
        <X className="h-3.5 w-3.5 stroke-[3.5]" />
      </div>
    );
  }

  if (status === "skipped") {
    return (
      <div
        className="absolute -top-2 -right-2 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-700 text-neutral-400 border border-neutral-600"
        title="Skipped"
      >
        <Minus className="h-3 w-3" />
      </div>
    );
  }

  return null;
}
