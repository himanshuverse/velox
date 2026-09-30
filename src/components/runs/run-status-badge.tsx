"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

interface RunStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export function RunStatusBadge({
  status,
  className = "",
  showIcon = true,
}: RunStatusBadgeProps) {
  switch (status.toLowerCase()) {
    case "completed":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium ${className}`}
        >
          {showIcon && <CheckCircle2 className="h-3 w-3 shrink-0" />}
          Completed
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-rose-500/30 bg-rose-500/10 text-rose-400 font-medium ${className}`}
        >
          {showIcon && <XCircle className="h-3 w-3 shrink-0" />}
          Failed
        </Badge>
      );
    case "running":
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-amber-500/30 bg-amber-500/10 text-amber-400 font-medium ${className}`}
        >
          {showIcon && <Loader2 className="h-3 w-3 shrink-0 animate-spin" />}
          Running
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge
          variant="outline"
          className={`gap-1.5 border-neutral-700 bg-neutral-800/60 text-neutral-400 font-medium ${className}`}
        >
          {showIcon && <Clock className="h-3 w-3 shrink-0" />}
          Pending
        </Badge>
      );
  }
}
