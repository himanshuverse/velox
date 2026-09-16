import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "@/lib/execution/topological-sort";
import { executeNode } from "@/lib/execution/node-runner";
import type { WorkflowNode, WorkflowEdge } from "@/lib/types/workflow";
import type { NodeExecutionContext } from "@/lib/execution/types";
import { Prisma } from "@/generated/prisma/client";

export const runWorkflow = inngest.createFunction(
  { id: "run-workflow", triggers: [{ event: "workflow/run.triggered" }] },
  async ({ event, step }) => {
    const { runId, workflowId, triggerInput } = event.data as {
      runId: string;
      workflowId: string;
      triggerInput?: unknown;
    };

    // 1. Load the workflow definition from the database
    const workflow = await step.run("load-workflow", async () => {
      return prisma.workflow.findUniqueOrThrow({
        where: { id: workflowId },
      });
    });

    // 2. Mark the run as "running"
    await step.run("mark-running", async () => {
      return prisma.workflowRun.update({
        where: { id: runId },
        data: { status: "running" },
      });
    });

    const nodes = (workflow.nodes ?? []) as unknown as WorkflowNode[];
    const edges = (workflow.edges ?? []) as unknown as WorkflowEdge[];

    if (nodes.length === 0) {
      await step.run("mark-empty-complete", async () => {
        return prisma.workflowRun.update({
          where: { id: runId },
          data: {
            status: "completed",
            completedAt: new Date(),
            logs: [
              {
                message: "Workflow executed with 0 nodes",
                status: "success",
                executedAt: new Date().toISOString(),
              },
            ] as unknown as Prisma.InputJsonValue,
          },
        });
      });
      return { success: true, message: "Empty workflow completed" };
    }

    // 3. Resolve execution order with Topological Sort
    const orderedNodes = await step.run("topological-sort", async () => {
      return topologicalSort(nodes, edges);
    });

    // Initialize execution context with optional trigger input
    const context: NodeExecutionContext = {
      __trigger_input__: triggerInput ?? {
        timestamp: new Date().toISOString(),
        manual: true,
      },
    };

    let hasFailure = false;
    const executionLogs: Array<{
      nodeId: string;
      nodeLabel: string;
      subtype: string;
      status: "success" | "failed" | "skipped";
      output: unknown;
      error?: string;
      durationMs: number;
      executedAt: string;
    }> = [];

    // 4. Step-by-step durable execution of each node
    for (const node of orderedNodes) {
      // If a previous node failed, we can skip remaining nodes
      if (hasFailure) {
        const skippedEntry = {
          nodeId: node.id,
          nodeLabel: node.label ?? node.id,
          subtype: node.subtype,
          status: "skipped" as const,
          output: null,
          durationMs: 0,
          executedAt: new Date().toISOString(),
        };
        executionLogs.push(skippedEntry);
        continue;
      }

      // Mark this specific node as running so the canvas animates with amber glow
      await step.run(`mark-node-running-${node.id}`, async () => {
        const intermediateLogs = [
          ...executionLogs,
          {
            nodeId: node.id,
            nodeLabel: node.label ?? node.id,
            subtype: node.subtype,
            status: "running" as const,
            output: null,
            durationMs: 0,
            executedAt: new Date().toISOString(),
          },
        ];
        return prisma.workflowRun.update({
          where: { id: runId },
          data: {
            logs: intermediateLogs as unknown as Prisma.InputJsonValue,
          },
        });
      });

      const result = await step.run(`execute-node-${node.id}`, async () => {
        // Run the node action with synchronous step pacing so Inngest execution is visible live
        const execPromise = executeNode(node, context);
        const [res] = await Promise.all([
          execPromise,
          new Promise((resolve) => setTimeout(resolve, 850)),
        ]);
        return res;
      });

      const logEntry = {
        nodeId: node.id,
        nodeLabel: node.label ?? node.id,
        subtype: node.subtype,
        status: result.status,
        output: result.output,
        error: result.error,
        durationMs: result.durationMs,
        executedAt: new Date().toISOString(),
      };

      executionLogs.push(logEntry);

      if (result.status === "success") {
        context[node.id] = result.output;
      } else {
        hasFailure = true;
      }

      // Persist incremental logs to DB
      await step.run(`log-progress-${node.id}`, async () => {
        return prisma.workflowRun.update({
          where: { id: runId },
          data: {
            logs: executionLogs as unknown as Prisma.InputJsonValue,
          },
        });
      });
    }

    // 5. Finalize run state
    const finalStatus = hasFailure ? "failed" : "completed";

    await step.run("finalize-run", async () => {
      return prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: finalStatus,
          completedAt: new Date(),
          logs: executionLogs as unknown as Prisma.InputJsonValue,
        },
      });
    });

    return {
      runId,
      status: finalStatus,
      totalNodes: orderedNodes.length,
      executedNodes: executionLogs.length,
    };
  }
);