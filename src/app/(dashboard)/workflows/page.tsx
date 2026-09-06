"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus, Workflow, Sparkles, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateWorkflowDialog } from "@/components/workflows/create-workflow-dialog";
import { WorkflowCard } from "@/components/workflows/workflow-card";

export default function WorkflowsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const trpc = useTRPC();
  const { data: workflows, isLoading } = useQuery(
    trpc.workflow.list.queryOptions()
  );

  const filteredWorkflows = workflows?.filter((wf) => {
    const matchesSearch =
      wf.name.toLowerCase().includes(search.toLowerCase()) ||
      (wf.description &&
        wf.description.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || wf.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Workflows</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Build, manage, and monitor your automated visual workflows.
          </p>
        </div>
        <CreateWorkflowDialog />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search workflows by name..."
            className="pl-9 bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-orange-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-neutral-900 border border-neutral-800 self-start sm:self-auto">
          {["all", "active", "draft", "paused"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === tab
                  ? "bg-neutral-800 text-orange-400 font-semibold shadow-sm"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Grid / Loading / Empty States */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5 space-y-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                  <Skeleton className="h-3 w-1/2 bg-neutral-800" />
                </div>
              </div>
              <Skeleton className="h-4 w-1/3 bg-neutral-800" />
              <div className="pt-2 flex justify-between">
                <Skeleton className="h-5 w-16 bg-neutral-800" />
                <Skeleton className="h-5 w-20 bg-neutral-800" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/20 py-16 px-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 mb-4">
            <Workflow className="h-7 w-7 text-neutral-500" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-200">
            {search || statusFilter !== "all"
              ? "No matching workflows found"
              : "No workflows yet"}
          </h3>
          <p className="text-sm text-neutral-400 max-w-sm mt-1 mb-6">
            {search || statusFilter !== "all"
              ? "Try adjusting your search keywords or filter to find what you're looking for."
              : "Create your first workflow to automate tasks across GitHub, Slack, Notion, Discord, and more."}
          </p>
          {search || statusFilter !== "all" ? (
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-800"
            >
              Clear Filters
            </Button>
          ) : (
            <CreateWorkflowDialog>
              <Button className="bg-orange-600 hover:bg-orange-500 text-white font-medium gap-2 shadow-lg shadow-orange-600/20">
                <Plus className="h-4 w-4" />
                Create Your First Workflow
              </Button>
            </CreateWorkflowDialog>
          )}
        </div>
      )}
    </div>
  );
}
