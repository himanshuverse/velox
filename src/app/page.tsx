"use client";

import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export default function WorkflowTestPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");

  // 1. List query using queryOptions()
  const { data: workflows, isLoading } = useQuery(
    trpc.workflow.list.queryOptions()
  );

  // 2. Create mutation
  const createMutation = useMutation(
    trpc.workflow.create.mutationOptions({
      onSuccess: () => {
        setName("");
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
    })
  );

  // 3. Delete mutation
  const deleteMutation = useMutation(
    trpc.workflow.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
    })
  );

  // 4. Duplicate mutation
  const duplicateMutation = useMutation(
    trpc.workflow.duplicate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
    })
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">tRPC Workflow CRUD Test</h1>

      {/* Create Form */}
      <div className="flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workflow Name"
          className="border border-neutral-700 bg-neutral-900 px-3 py-2 rounded text-white flex-1"
        />
        <button
          onClick={() =>
            createMutation.mutate({
              name,
              description: "Created from test page",
            })
          }
          disabled={!name.trim() || createMutation.isPending}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded font-medium"
        >
          {createMutation.isPending ? "Creating..." : "Create Workflow"}
        </button>
      </div>

      {/* List Workflows */}
      <div className="space-y-3">
        {isLoading && <p className="text-gray-400">Loading workflows...</p>}

        {workflows?.length === 0 && (
          <p className="text-gray-500">No workflows found. Create one above!</p>
        )}

        {workflows?.map((wf) => (
          <div
            key={wf.id}
            className="border border-neutral-800 bg-neutral-900/50 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{wf.name}</span>
                <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded uppercase font-mono">
                  {wf.status}
                </span>
              </div>
              <p className="text-sm text-neutral-400">
                {wf.description || "No description"} • Runs: {wf._count.runs}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => duplicateMutation.mutate({ id: wf.id })}
                disabled={duplicateMutation.isPending}
                className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 px-3 py-1.5 rounded text-sm"
              >
                Duplicate
              </button>
              <button
                onClick={() => deleteMutation.mutate({ id: wf.id })}
                disabled={deleteMutation.isPending}
                className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 px-3 py-1.5 rounded text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
