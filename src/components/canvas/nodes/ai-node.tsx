"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { Sparkles } from "lucide-react";
import { NodeData } from "./trigger-node";

export const AiNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  const label = nodeData.label || "AI Prompt";
  const model = (nodeData.config?.model as string) || "GPT-4o";
  const subtitle = nodeData.subtitle || `Run with ${model}`;

  return (
    <div className="flex flex-col items-center select-none group">
      {/* The Squircle Node Box */}
      <div
        className={`relative flex h-[74px] w-[74px] items-center justify-center rounded-[20px] border transition-all duration-150 ${
          selected
            ? "border-cyan-500 bg-[#262c38] shadow-lg shadow-cyan-950/50 ring-2 ring-cyan-500/40 scale-105"
            : "border-[#373f50] bg-[#202530] hover:border-[#4f5b72] hover:bg-[#252b37] shadow-md"
        }`}
      >
        {/* Left Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-[#64748b] hover:!bg-cyan-400 transition-colors !-left-[7px]"
        />

        {/* Centered Large Logo / Icon */}
        <Sparkles className="h-8 w-8 stroke-[2.2] text-cyan-400" />

        {/* Right Output Handle */}
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-[#64748b] hover:!bg-cyan-400 transition-colors !-right-[7px]"
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

AiNode.displayName = "AiNode";
