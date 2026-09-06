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
                        strokeWidth: selected ? 2.5 : 2,
                        stroke: selected ? "#f97316" : "#525e70",
                        strokeDasharray: "5 5",
                        strokeLinecap: "round",
                        transition: "stroke 0.2s, stroke-width 0.2s",
                        filter: selected ? "drop-shadow(0 0 4px rgba(249, 115, 22, 0.5))" : undefined,
                    }}
                    className="animated-edge"
                />
            </>
        );
    }
);

CustomEdge.displayName = "CustomEdge";
