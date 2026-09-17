"use client";

import { memo } from "react";
import {
    BaseEdge,
    EdgeProps,
    getSmoothStepPath,
} from "@xyflow/react";

export const CustomEdge = memo(
    ({
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        style = {},
        markerEnd,
        selected,
        data,
    }: EdgeProps) => {
        // Horizontal step path with smooth rounded corner radius
        const [edgePath] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
            borderRadius: 8,
        });

        const edgeData = (data ?? {}) as { executionStatus?: string };
        const isRunning = edgeData.executionStatus === "running";
        const isSuccess = edgeData.executionStatus === "success";

        let strokeColor = selected ? "#f97316" : "#525e70";
        let filterEffect = selected ? "drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))" : undefined;

        if (isRunning) {
            strokeColor = "#f59e0b";
            filterEffect = "drop-shadow(0 0 6px rgba(245, 158, 11, 0.8))";
        } else if (isSuccess) {
            strokeColor = "#10b981";
            filterEffect = "drop-shadow(0 0 5px rgba(16, 185, 129, 0.6))";
        }

        return (
            <>
                {/* Invisible wider stroke for easy click selection */}
                <BaseEdge
                    id={`${id}-hitarea`}
                    path={edgePath}
                    style={{
                        strokeWidth: 16,
                        stroke: "transparent",
                        cursor: "pointer",
                    }}
                />

                {/* Clean dashed connection wire (matching n8n design) */}
                <BaseEdge
                    id={id}
                    path={edgePath}
                    markerEnd={markerEnd}
                    style={{
                        ...style,
                        strokeWidth: isRunning || isSuccess || selected ? 2.5 : 2,
                        stroke: strokeColor,
                        strokeDasharray: "5 5",
                        strokeLinecap: "round",
                        transition: "stroke 0.25s, stroke-width 0.25s",
                        filter: filterEffect,
                    }}
                    className={isRunning ? "animated-edge-running" : "animated-edge-continuous"}
                />
            </>
        );
    }
);

CustomEdge.displayName = "CustomEdge";
