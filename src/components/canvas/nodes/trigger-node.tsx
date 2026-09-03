"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { MousePointer2 } from "lucide-react";
import { getNodeMeta } from "@/lib/canvas/node-meta";

export interface NodeData {
  label?: string;
  subtype?: string;
  subtitle?: string;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

export const TriggerNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  const meta = getNodeMeta(nodeData.subtype || "manual");
  const Icon = meta.icon || MousePointer2;

  const label = nodeData.label || meta.label;
  const subtitle = nodeData.subtitle || meta.subtitle || "When clicking 'Execute workflow'";

  return (
    <div className="flex flex-col items-center select-none group">
      {/* The Squircle Node Box */}
      <div
        className={`relative flex h-[74px] w-[74px] items-center justify-center rounded-[20px] border transition-all duration-150 ${
          selected
            ? "border-orange-500 bg-[#262c38] shadow-lg shadow-orange-950/50 ring-2 ring-orange-500/40 scale-105"
            : "border-[#373f50] bg-[#202530] hover:border-[#4f5b72] hover:bg-[#252b37] shadow-md"
        }`}
      >
        {/* Centered Large Logo / Icon */}
        <Icon className={`h-8 w-8 stroke-[2.2] ${meta.iconColor || "text-orange-500"}`} />

        {/* Right Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-[#64748b] hover:!bg-[#f97316] transition-colors !-right-[7px]"
        />
      </div>

      {/* Label and Subtitle Below the Node */}
      <div className="mt-2.5 flex flex-col items-center text-center max-w-[160px] pointer-events-none">
        <span className="text-[13px] font-bold text-white tracking-tight leading-tight">
          {label}
        </span>
        <span className="text-[11px] text-neutral-400 mt-0.5 leading-snug font-normal">
          {subtitle}
        </span>
      </div>
    </div>
  );
});

TriggerNode.displayName = "TriggerNode";
