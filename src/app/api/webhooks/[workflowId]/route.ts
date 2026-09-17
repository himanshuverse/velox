import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { inngest } from "@/inngest/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;

    if (!workflowId) {
      return NextResponse.json(
        { error: "Workflow ID is required" },
        { status: 400 }
      );
    }

    // 1. Verify workflow exists
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      return NextResponse.json(
        { error: "Workflow not found" },
        { status: 404 }
      );
    }

    if (workflow.status === "paused") {
      return NextResponse.json(
        { error: "Workflow is paused and cannot receive we bhook events" },
        { status: 403 }
      );
    }

    // 2. Parse request payload
    let bodyPayload: unknown = null;
    try {
      bodyPayload = await req.json();
    } catch {
      try {
        bodyPayload = await req.text();
      } catch {
        bodyPayload = null;
      }
    }

    const headers = Object.fromEntries(req.headers.entries());

    const triggerInput = {
      body: bodyPayload,
      headers,
      receivedAt: new Date().toISOString(),
    };

    // 3. Create WorkflowRun entry
    const run = await prisma.workflowRun.create({
      data: {
        workflowId: workflow.id,
        status: "pending",
        startedAt: new Date(),
      },
    });

    // 4. Trigger Inngest workflow execution
    await inngest.send({
      name: "workflow/run.triggered",
      data: {
        runId: run.id,
        workflowId: workflow.id,
        triggerInput,
      },
    });

    return NextResponse.json(
      {
        success: true,
        runId: run.id,
        workflowId: workflow.id,
        message: "Workflow run initiated successfully",
      },
      { status: 202 }
    );
  } catch (error: any) {
    console.error("Webhook trigger error:", error);
    return NextResponse.json(
      { error: "Internal server error triggering workflow", details: error?.message },
      { status: 500 }
    );
  }
}
