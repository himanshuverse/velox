"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "./nodes";
import { CustomEdge } from "./custom-edge";
import { CanvasHeader } from "./canvas-header";
import { NodeSidebar } from "./sidebar/node-sidebar";
import { NodeConfigPanel } from "./config/node-config-panel";
import {
  toReactFlowNodes,
  toReactFlowEdges,
  toDbNodes,
  toDbEdges,
} from "@/lib/canvas/transform";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkflowNode, WorkflowEdge } from "@/lib/types/workflow";

interface WorkflowCanvasProps {
  workflow: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    nodes: unknown;
    edges: unknown;
  };
}

const edgeTypes = {
  custom: CustomEdge,
};

// Default starter template if canvas is empty
const defaultStarterNodes: WorkflowNode[] = [
  {
    id: "trigger_1",
    type: "trigger",
    subtype: "manual",
    label: "Manual Trigger",
    config: {},
    position: { x: 200, y: 220 },
  },
  {
    id: "action_1",
    type: "action",
    subtype: "http_request",
    label: "HTTP Request",
    config: {},
    position: { x: 480, y: 220 },
  },
];

const defaultStarterEdges: WorkflowEdge[] = [
  {
    id: "edge_trigger_1_to_action_1",
    source: "trigger_1",
    target: "action_1",
  },
];

// Inner canvas component that has access to useReactFlow
function WorkflowCanvasInner({ workflow }: WorkflowCanvasProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { screenToFlowPosition } = useReactFlow();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Initial node state from DB or starter template
  const initialDbNodes =
    Array.isArray(workflow.nodes) && workflow.nodes.length > 0
      ? (workflow.nodes as WorkflowNode[])
      : defaultStarterNodes;

  const initialDbEdges =
    Array.isArray(workflow.edges) && workflow.edges.length > 0
      ? (workflow.edges as WorkflowEdge[])
      : defaultStarterEdges;

  const [nodes, setNodes, onNodesChange] = useNodesState(
    toReactFlowNodes(initialDbNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toReactFlowEdges(initialDbEdges)
  );

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const isFirstRender = useRef(true);

  // Selected node object
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || null;

  // tRPC auto-save mutation
  const updateMutation = useMutation(
    trpc.workflow.update.mutationOptions({
      onSuccess: () => {
        setIsSaving(false);
        setLastSavedAt(new Date());
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
      onError: () => {
        setIsSaving(false);
      },
    })
  );

  // Handle new edge connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            id: `edge_${connection.source}_to_${connection.target}_${Date.now()}`,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Drag over handler for HTML5 drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Drop handler: spawns new node at cursor position
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const rawData = event.dataTransfer.getData("application/reactflow");
      if (!rawData) return;

      try {
        const { type, subtype, label } = JSON.parse(rawData);

        // Convert screen client coordinates to flow coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        const newNodeId = `node_${subtype}_${Date.now()}`;
        const newNode: Node = {
          id: newNodeId,
          type,
          position,
          data: {
            label,
            subtype,
            config: {},
          },
        };

        setNodes((nds) => nds.concat(newNode));
        setSelectedNodeId(newNodeId);
      } catch (err) {
        console.error("Failed to parse dropped node data", err);
      }
    },
    [screenToFlowPosition, setNodes]
  );

  // Node selection handlers
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Update node config and label from inspector
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: { label?: string; config?: Record<string, unknown> }) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id !== nodeId) return node;
          return {
            ...node,
            data: {
              ...node.data,
              ...(updates.label !== undefined && { label: updates.label }),
              ...(updates.config !== undefined && { config: updates.config }),
            },
          };
        })
      );
    },
    [setNodes]
  );

  // Delete node and its connected edges
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [selectedNodeId, setNodes, setEdges]
  );

  // Keyboard shortcut to delete selected node
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === "input" || activeTag === "textarea") return;
        handleDeleteNode(selectedNodeId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, handleDeleteNode]);

  // Debounced auto-save effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setIsSaving(true);
    const timeout = setTimeout(() => {
      updateMutation.mutate({
        id: workflow.id,
        nodes: toDbNodes(nodes),
        edges: toDbEdges(edges),
      });
    }, 1000);

    return () => clearTimeout(timeout);
  }, [nodes, edges, workflow.id]);

  return (
    <div className="flex h-full flex-1 w-full flex-col bg-neutral-950 overflow-hidden">
      {/* Canvas Top Bar */}
      <CanvasHeader
        workflowId={workflow.id}
        initialName={workflow.name}
        status={workflow.status}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
      />

      {/* Studio Layout (Infinite Canvas + Right Side Panel) */}
      <div className="relative flex flex-1 w-full h-full min-h-0 overflow-hidden">
        {/* Infinite Canvas */}
        <div
          className="relative flex-1 w-full h-full min-h-0 overflow-hidden"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.5, maxZoom: 1.0 }}
            minZoom={0.2}
            maxZoom={2}
            proOptions={{ hideAttribution: true }}
            className="bg-[#12161f]"
          >
            {/* Dot Grid Background */}
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.2}
              color="rgba(255, 255, 255, 0.07)"
            />

            {/* Zoom / View Controls */}
            <Controls
              className="!bg-neutral-900 !border-neutral-800 !rounded-lg !shadow-xl [&>button]:!bg-neutral-900 [&>button]:!border-neutral-800 [&>button]:!text-neutral-300 hover:[&>button]:!bg-neutral-800"
              showInteractive={false}
            />

            {/* Canvas MiniMap */}
            <MiniMap
              className="!bg-neutral-900/80 !border !border-neutral-800 !rounded-xl overflow-hidden !bottom-4 !right-4 shadow-xl"
              nodeColor={(node: Node) => {
                switch (node.type) {
                  case "trigger":
                    return "#f97316";
                  case "condition":
                    return "#a855f7";
                  case "ai":
                    return "#06b6d4";
                  default:
                    return "#64748b";
                }
              }}
              maskColor="rgba(0, 0, 0, 0.7)"
            />
          </ReactFlow>
        </div>

        {/* Right Side Dock: Configuration Inspector if node selected, else Node Library */}
        {selectedNode ? (
          <NodeConfigPanel
            node={selectedNode}
            workflowId={workflow.id}
            onClose={() => setSelectedNodeId(null)}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
          />
        ) : (
          <NodeSidebar
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen((prev) => !prev)}
          />
        )}
      </div>
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
