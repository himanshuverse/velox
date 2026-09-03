"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Globe, AlertTriangle } from "lucide-react";
import { getNodeMeta } from "@/lib/canvas/node-meta";
import { NodeData } from "./trigger-node";

export const ActionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  const meta = getNodeMeta(nodeData.subtype || "http_request");
  const Icon = meta.icon || Globe;

  const label = nodeData.label || meta.label;
  const subtitle = nodeData.subtitle || meta.subtitle || "Configure action";

  // Display warning icon if essential configuration is missing
  const isUnconfigured =
    !nodeData.config ||
    Object.keys(nodeData.config).length === 0 ||
    (nodeData.subtype === "http_request" && !nodeData.config.url);

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
        {/* Left Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-[#64748b] hover:!bg-[#f97316] transition-colors !-left-[7px]"
        />

        {/* Centered Large Logo / Icon */}
        <Icon className={`h-8 w-8 stroke-[2.2] ${meta.iconColor || "text-neutral-300"}`} />

        {/* Unconfigured / Warning Badge at bottom right */}
        {isUnconfigured && (
          <div className="absolute bottom-1.5 right-1.5 flex h-4 w-4 items-center justify-center">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          </div>
        )}

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

ActionNode.displayName = "ActionNode";
