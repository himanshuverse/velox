"use client";

import { useState, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  Zap,
  Play,
  GitBranch,
  Sparkles,
  PanelRightClose,
  PanelRightOpen,
  GripVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NODE_METAS, NodeMeta } from "@/lib/canvas/node-meta";
import { NodeType } from "@/lib/types/workflow";

interface NodeSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface CategoryGroup {
  id: NodeType;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const CATEGORIES: CategoryGroup[] = [
  { id: "trigger", name: "Triggers", icon: Zap, color: "text-emerald-400" },
  { id: "action", name: "Actions", icon: Play, color: "text-orange-400" },
  { id: "condition", name: "Logic & Branching", icon: GitBranch, color: "text-purple-400" },
  { id: "ai", name: "AI & LLM", icon: Sparkles, color: "text-cyan-400" },
];

export function NodeSidebar({ isOpen, onToggle }: NodeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    trigger: true,
    action: true,
    condition: true,
    ai: true,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  // Filter nodes based on search query
  const filteredNodes = useMemo(() => {
    const allMetas = Object.values(NODE_METAS);
    if (!searchQuery.trim()) return allMetas;

    const query = searchQuery.toLowerCase();
    return allMetas.filter(
      (node) =>
        node.label.toLowerCase().includes(query) ||
        node.subtype.toLowerCase().includes(query) ||
        node.description.toLowerCase().includes(query) ||
        (node.subtitle && node.subtitle.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  // Group filtered nodes by category
  const nodesByCategory = useMemo(() => {
    const map: Record<NodeType, NodeMeta[]> = {
      trigger: [],
      action: [],
      condition: [],
      ai: [],
    };

    filteredNodes.forEach((node) => {
      if (map[node.type]) {
        map[node.type].push(node);
      }
    });

    return map;
  }, [filteredNodes]);

  // HTML5 Drag Start Handler
  const onDragStart = (event: React.DragEvent, nodeMeta: NodeMeta) => {
    const payload = {
      type: nodeMeta.type,
      subtype: nodeMeta.subtype,
      label: nodeMeta.label,
    };
    event.dataTransfer.setData("application/reactflow", JSON.stringify(payload));
    event.dataTransfer.effectAllowed = "move";
  };

  if (!isOpen) {
    return (
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="h-9 w-9 bg-neutral-900/90 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 shadow-xl backdrop-blur-md"
          title="Open Node Library"
        >
          <PanelRightOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <aside className="relative flex h-full min-h-0 w-80 shrink-0 flex-col border-l border-neutral-800/80 bg-[#151922]/95 backdrop-blur-md z-20 select-none shadow-2xl overflow-hidden">
      {/* Fixed Sidebar Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800/80 px-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono">
            Node Library
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
            Drag to canvas
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-7 w-7 text-neutral-400 hover:text-white hover:bg-neutral-800"
          title="Collapse Sidebar"
        >
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Fixed Search Bar */}
      <div className="p-3 shrink-0 border-b border-neutral-800/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-500" />
          <Input
            placeholder="Search nodes & integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8.5 bg-neutral-900/90 border-neutral-800 pl-8 text-xs text-neutral-200 placeholder:text-neutral-500 focus-visible:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Only This List Area Scrolls */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-4">
        {CATEGORIES.map((category) => {
          const nodes = nodesByCategory[category.id] || [];
          if (nodes.length === 0 && searchQuery) return null;

          const isExpanded = openCategories[category.id] ?? true;
          const CategoryIcon = category.icon;

          return (
            <div key={category.id} className="space-y-1.5">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center justify-between rounded px-2 py-1.5 text-xs font-semibold text-neutral-400 hover:bg-neutral-900/60 hover:text-neutral-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className={`h-3.5 w-3.5 ${category.color}`} />
                  <span>{category.name}</span>
                  <span className="text-[10px] text-neutral-600 font-mono">
                    ({nodes.length})
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-neutral-500" />
                )}
              </button>

              {/* Category Items */}
              {isExpanded && (
                <div className="space-y-1.5 pl-1">
                  {nodes.map((nodeMeta) => {
                    const Icon = nodeMeta.icon;
                    return (
                      <div
                        key={nodeMeta.subtype}
                        draggable
                        onDragStart={(e) => onDragStart(e, nodeMeta)}
                        className="group relative flex items-center gap-2.5 rounded-xl border border-neutral-800/80 bg-[#1a1f2c]/80 p-2 hover:border-neutral-700 hover:bg-[#202738] cursor-grab active:cursor-grabbing transition-all duration-150 shadow-sm hover:shadow-md"
                      >
                        <GripVertical className="h-3.5 w-3.5 text-neutral-600 group-hover:text-neutral-400 shrink-0" />
                        
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800 group-hover:border-neutral-700">
                          <Icon className={`h-4 w-4 ${nodeMeta.iconColor || "text-neutral-300"}`} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-xs font-medium text-neutral-200 group-hover:text-white">
                            {nodeMeta.label}
                          </div>
                          <div className="truncate text-[10px] text-neutral-500 group-hover:text-neutral-400">
                            {nodeMeta.subtitle || nodeMeta.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
