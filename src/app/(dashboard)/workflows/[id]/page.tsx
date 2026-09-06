"use client";

import { use } from "react";
import Link from "next/link";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowCanvas } from "@/components/canvas/workflow-canvas";

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
}

export default function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = use(params);
  const trpc = useTRPC();

  const { data: workflow, isLoading, error } = useQuery(
    trpc.workflow.getById.queryOptions({ id })
  );

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 text-neutral-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-sm font-medium">Loading canvas editor...</p>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 p-6 text-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Workflow Not Found</h2>
          <p className="text-sm text-neutral-400">
            This workflow may have been deleted or you don't have permission to view it.
          </p>
        </div>
        <Button asChild variant="outline" className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 gap-2">
          <Link href="/workflows">
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Link>
        </Button>
      </div>
    );
  }

  return <WorkflowCanvas workflow={workflow} />;
}
