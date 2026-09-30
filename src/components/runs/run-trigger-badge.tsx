"use client";

import { Badge } from "@/components/ui/badge";
import { Zap, Globe, Clock } from "lucide-react";

interface RunTriggerBadgeProps {
  trigger?: string | null;
  className?: string;
}

export function RunTriggerBadge({
  trigger = "manual",
  className = "",
}: RunTriggerBadgeProps) {
  const t = (trigger || "manual").toLowerCase();

  switch (t) {
    case "webhook":
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-blue-500/30 bg-blue-500/10 text-blue-400 font-normal ${className}`}
        >
          <Globe className="h-3 w-3" />
          Webhook
        </Badge>
      );
    case "schedule":
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-purple-500/30 bg-purple-500/10 text-purple-400 font-normal ${className}`}
        >
          <Clock className="h-3 w-3" />
          Schedule
        </Badge>
      );
    case "manual":
    default:
      return (
        <Badge
          variant="outline"
          className={`gap-1 border-orange-500/30 bg-orange-500/10 text-orange-400 font-normal ${className}`}
        >
          <Zap className="h-3 w-3" />
          Manual
        </Badge>
      );
  }
}
