"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Loader2, Sparkles, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CanvasHeaderProps {
  workflowId: string;
  initialName: string;
  status: string;
  isSaving: boolean;
  lastSavedAt: Date | null;
}

export function CanvasHeader({
  workflowId,
  initialName,
  status,
  isSaving,
  lastSavedAt,
}: CanvasHeaderProps) {
  const [name, setName] = useState(initialName);
  const [isEditingName, setIsEditingName] = useState(false);
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateNameMutation = useMutation(
    trpc.workflow.update.mutationOptions({
      onSuccess: () => {
        setIsEditingName(false);
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
    })
  );

  const handleNameBlur = () => {
    if (name.trim() && name !== initialName) {
      updateNameMutation.mutate({
        id: workflowId,
        name: name.trim(),
      });
    } else {
      setName(initialName);
      setIsEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNameBlur();
    } else if (e.key === "Escape") {
      setName(initialName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="flex h-14 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur-md">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
        >
          <Link href="/workflows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <div className="h-4 w-[1px] bg-neutral-800" />

        {isEditingName ? (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="rounded border border-orange-500 bg-neutral-900 px-2 py-1 text-sm font-semibold text-white outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="group flex items-center gap-2 rounded px-2 py-1 text-left hover:bg-neutral-900"
          >
            <span className="text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
              {name}
            </span>
            <span className="text-[11px] text-neutral-500 group-hover:text-neutral-400">
              (Click to rename)
            </span>
          </button>
        )}

        <Badge
          className={
            status === "active"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-neutral-800 text-neutral-400 border-neutral-700"
          }
        >
          {status}
        </Badge>
      </div>

      {/* Right: Saving Indicator + Run Trigger */}
      <div className="flex items-center gap-3">
        {/* Auto-save status */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-orange-400" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-neutral-500">
                {lastSavedAt ? "Auto-saved" : "Saved"}
              </span>
            </>
          )}
        </div>

        <Button
          size="sm"
          className="bg-orange-600 hover:bg-orange-500 text-white font-medium gap-1.5 h-8 shadow-md shadow-orange-600/20"
          onClick={() => alert("Execution Engine wiring in Phase 4!")}
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          Run
        </Button>
      </div>
    </div>
  );
}
