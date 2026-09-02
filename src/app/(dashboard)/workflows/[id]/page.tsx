import Link from "next/link";
import { ArrowLeft, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function WorkflowEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] rounded-xl border border-neutral-800 bg-neutral-900/40 p-6 items-center justify-center text-center space-y-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-500 shadow-xl shadow-orange-950/20">
        <Zap className="h-8 w-8" />
      </div>

      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-bold text-white">Visual Canvas </h2>
        <p className="text-sm text-neutral-400">
          Workflow ID: <span className="font-mono text-xs text-orange-400">{id}</span>
        </p>
      </div>

      <div className="pt-2">
        <Button asChild variant="outline" className="border-neutral-800 text-neutral-300 hover:bg-neutral-800 gap-2">
          <Link href="/workflows">
            <ArrowLeft className="h-4 w-4" />
            Back to Workflows
          </Link>
        </Button>
      </div>
    </div>
  );
}
