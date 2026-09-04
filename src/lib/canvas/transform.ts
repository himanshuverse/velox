import { Node, Edge } from "@xyflow/react";
import { WorkflowNode, WorkflowEdge } from "@/lib/types/workflow";

/**
 * Transforms database workflow nodes into React Flow node format.
 */
export function toReactFlowNodes(dbNodes: WorkflowNode[] | unknown): Node[] {
  if (!Array.isArray(dbNodes)) return [];

  return dbNodes.map((node) => ({
    id: node.id,
    type: node.type || "action",
    position: node.position || { x: 250, y: 100 },
    data: {
      label: node.label,
      subtype: node.subtype,
      config: node.config || {},
    },
  }));
}

/**
 * Transforms database workflow edges into React Flow edge format.
 */
export function toReactFlowEdges(dbEdges: WorkflowEdge[] | unknown): Edge[] {
  if (!Array.isArray(dbEdges)) return [];

  return dbEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
    type: "custom",
  }));
}

/**
 * Transforms React Flow canvas nodes back into clean database format.
 */
export function toDbNodes(rfNodes: Node[]): WorkflowNode[] {
  return rfNodes.map((node) => ({
    id: node.id,
    type: (node.type as WorkflowNode["type"]) || "action",
    subtype: (node.data?.subtype as WorkflowNode["subtype"]) || "http_request",
    label: (node.data?.label as string) || "Node",
    config: (node.data?.config as Record<string, unknown>) || {},
    position: {
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    },
  }));
}

/**
 * Transforms React Flow canvas edges back into clean database format.
 */
export function toDbEdges(rfEdges: Edge[]): WorkflowEdge[] {
  return rfEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || undefined,
    targetHandle: edge.targetHandle || undefined,
  }));
}
