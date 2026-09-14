import type { WorkflowNode } from "@/lib/types/workflow";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";
import { resolveTemplate } from "../template-resolver";

interface EmailConfig {
  to?: string;
  subject?: string;
  body?: string;
}

export async function executeEmail(
  node: WorkflowNode,
  context: NodeExecutionContext
): Promise<NodeExecutionResult["output"]> {
  const config = (node.config ?? {}) as EmailConfig;
  const to = resolveTemplate(config.to ?? "", context);
  const subject = resolveTemplate(config.subject ?? "(No Subject)", context);
  const body = resolveTemplate(config.body ?? "", context);

  if (!to) {
    throw new Error("Email node is missing a recipient ('to') address");
  }

  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
        to,
        subject,
        text: body,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Resend email error: ${errorText}`);
    }

    const data = await res.json();
    return {
      sent: true,
      messageId: data.id,
      to,
      subject,
    };
  }

  // Graceful simulation fallback for local development without RESEND_API_KEY
  return {
    sent: true,
    simulated: true,
    to,
    subject,
    bodyPreview: body.slice(0, 100),
    note: "Add RESEND_API_KEY to your .env to send real emails.",
  };
}
