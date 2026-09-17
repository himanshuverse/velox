"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { GitBranch } from "lucide-react";
import { NodeData } from "./trigger-node";
import { NodeStatusBadge, getNodeStatusStyles } from "./node-status-badge";

export const ConditionNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as NodeData;
  const label = nodeData.label || "If / Else";
  const subtitle = nodeData.subtitle || "Branch workflow execution";
  const executionStatus = nodeData.executionStatus;

  return (
    <div className="flex flex-col items-center select-none group">
      {/* The Squircle Node Box */}
      <div
        className={`relative flex h-[74px] w-[74px] items-center justify-center rounded-[20px] border transition-all duration-200 ${getNodeStatusStyles(
          executionStatus,
          selected
        )}`}
      >
        {/* Real-time Execution Status Badge */}
        <NodeStatusBadge status={executionStatus} />
        {/* Left Input Handle */}
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-[#64748b] hover:!bg-purple-400 transition-colors !-left-[7px]"
        />

        {/* Centered Large Logo / Icon */}
        <GitBranch className="h-8 w-8 stroke-[2.2] text-purple-400" />

        {/* True Output Handle (Top Right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="true"
          style={{ top: "30%" }}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-emerald-400 hover:!bg-emerald-300 transition-colors !-right-[7px]"
        />

        {/* False Output Handle (Bottom Right) */}
        <Handle
          type="source"
          position={Position.Right}
          id="false"
          style={{ top: "70%" }}
          className="!h-3.5 !w-3.5 !rounded-full !border-[2.5px] !border-[#202530] !bg-rose-400 hover:!bg-rose-300 transition-colors !-right-[7px]"
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

ConditionNode.displayName = "ConditionNode";
