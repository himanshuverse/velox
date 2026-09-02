"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateWorkflowDialogProps {
  children?: React.ReactNode;
}

export function CreateWorkflowDialog({ children }: CreateWorkflowDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    trpc.workflow.create.mutationOptions({
      onSuccess: (workflow) => {
        setOpen(false);
        setName("");
        setDescription("");
        queryClient.invalidateQueries(trpc.workflow.list.queryOptions());
        // Redirect directly to the canvas editor
        router.push(`/workflows/${workflow.id}`);
      },
      onError: (err) => {
        setError(err.message || "Failed to create workflow");
      },
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Workflow name is required");
      return;
    }
    setError(null);
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-orange-600 hover:bg-orange-500 text-white font-medium gap-2 shadow-lg shadow-orange-600/20">
            <Plus className="h-4 w-4" />
            New Workflow
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-neutral-900 border-neutral-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-orange-500" />
              Create New Workflow
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              Start with a blank canvas to build your visual automation.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 text-xs rounded bg-red-500/10 border border-red-500/20 text-red-400">
                {error}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-sm font-medium text-neutral-200">
                Workflow Name <span className="text-orange-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. GitHub Issue to Notion Task"
                className="bg-neutral-950 border-neutral-800 text-white focus-visible:ring-orange-500"
                autoFocus
                disabled={createMutation.isPending}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-sm font-medium text-neutral-200">
                Description <span className="text-xs text-neutral-500 font-normal">(optional)</span>
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this workflow automates..."
                className="bg-neutral-950 border-neutral-800 text-white resize-none h-24 focus-visible:ring-orange-500"
                disabled={createMutation.isPending}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-neutral-800 text-neutral-300 hover:bg-neutral-800"
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-500 text-white font-medium gap-2"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Open Canvas"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
