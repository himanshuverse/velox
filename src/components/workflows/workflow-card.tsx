"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Workflow,
  MoreVertical,
  Play,
  Copy,
  Trash2,
  ExternalLink,
  Clock,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowCardProps {
  workflow: {
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    _count: {
      runs: number;
    };
  };
}

export function WorkflowCard({ workflow }: WorkflowCardProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const duplicateMutation = useMutation(
    trpc.workflow.duplicate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
    })
  );

  const deleteMutation = useMutation(
    trpc.workflow.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
      },
    })
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">
            Active
          </Badge>
        );
      case "paused":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20">
            Paused
          </Badge>
        );
      default:
        return (
          <Badge className="bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-800">
            Draft
          </Badge>
        );
    }
  };

  const formattedDate = formatDistanceToNow(new Date(workflow.updatedAt), {
    addSuffix: true,
  });

  return (
    <Card className="group relative bg-neutral-900/60 border-neutral-800/80 hover:border-neutral-700/80 transition-all duration-200 hover:shadow-xl hover:shadow-orange-950/10 flex flex-col justify-between overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/workflows/${workflow.id}`}
            className="flex items-center gap-3 group/title flex-1 min-w-0"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 group-hover/title:bg-orange-500/20 transition-colors">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base text-neutral-100 group-hover/title:text-orange-400 truncate transition-colors">
                {workflow.name}
              </h3>
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                {workflow.description || "No description provided"}
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-neutral-900 border-neutral-800 text-neutral-200"
            >
              <DropdownMenuItem asChild>
                <Link
                  href={`/workflows/${workflow.id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="h-4 w-4 text-neutral-400" />
                  <span>Open Canvas</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => duplicateMutation.mutate({ id: workflow.id })}
                disabled={duplicateMutation.isPending}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Copy className="h-4 w-4 text-neutral-400" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem
                onClick={() => deleteMutation.mutate({ id: workflow.id })}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2">
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5 text-neutral-500" />
            <span>{workflow._count.runs} {workflow._count.runs === 1 ? "run" : "runs"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-neutral-500" />
            <span>Updated {formattedDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="px-5 py-3 border-t border-neutral-800/50 bg-neutral-950/40 flex items-center justify-between">
        {getStatusBadge(workflow.status)}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-xs text-neutral-400 hover:text-white hover:bg-neutral-800 gap-1.5 h-7 px-2.5"
        >
          <Link href={`/workflows/${workflow.id}`}>
            Edit Canvas
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
