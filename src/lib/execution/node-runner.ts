import type { WorkflowNode } from "@/lib/types/workflow";
import type { NodeExecutionContext, NodeExecutionResult } from "./types";
import { executeHttpRequest } from "./handlers/http-handler";
import { executeCondition } from "./handlers/condition-handler";
import { executeAiPrompt } from "./handlers/ai-handler";
import { executeEmail } from "./handlers/email-handler";
import { resolveTemplate } from "./template-resolver";

export async function executeNode(
  node: WorkflowNode,
  context: NodeExecutionContext
): Promise<NodeExecutionResult> {
  const start = Date.now();

  try {
    let output: unknown;

    switch (node.subtype) {
      // 1. Triggers pass through initial trigger data
      case "manual":
      case "webhook":
      case "schedule":
      case "github_push":
      case "github_pull_request":
      case "google_form_new_response": {
        output = context["__trigger_input__"] ?? {
          timestamp: new Date().toISOString(),
          triggeredBy: node.subtype,
        };
        break;
      }

      // 2. HTTP Request
      case "http_request": {
        output = await executeHttpRequest(node, context);
        break;
      }

      // 3. Condition Logic
      case "condition": {
        output = await executeCondition(node, context);
        break;
      }

      // 4. AI Prompt
      case "ai_prompt": {
        output = await executeAiPrompt(node, context);
        break;
      }

      // 5. Send Email
      case "send_email": {
        output = await executeEmail(node, context);
        break;
      }

      // 6. Discord Webhook Message
      case "discord_send_message": {
        const config = (node.config ?? {}) as { webhookUrl?: string; content?: string; username?: string };
        const webhookUrl = resolveTemplate(config.webhookUrl ?? "", context);
        const content = resolveTemplate(config.content ?? "", context);

        if (!webhookUrl) {
          throw new Error("Discord node is missing a Webhook URL");
        }

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: content || "Workflow execution notification",
            username: config.username || "Velox Bot",
          }),
        });

        output = {
          success: res.ok,
          status: res.status,
          message: content,
        };
        break;
      }

      // 7. Slack Webhook Message
      case "slack_send_message": {
        const config = (node.config ?? {}) as { webhookUrl?: string; text?: string };
        const webhookUrl = resolveTemplate(config.webhookUrl ?? "", context);
        const text = resolveTemplate(config.text ?? "", context);

        if (!webhookUrl) {
          throw new Error("Slack node is missing a Webhook URL");
        }

        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text || "Workflow execution notification",
          }),
        });

        output = {
          success: res.ok,
          status: res.status,
          text,
        };
        break;
      }

      default: {
        output = {
          acknowledged: true,
          subtype: node.subtype,
          message: `Executed node of type ${node.subtype}`,
        };
      }
    }

    return {
      status: "success",
      output,
      durationMs: Date.now() - start,
    };
  } catch (err: any) {
    return {
      status: "failed",
      output: null,
      error: err?.message ?? String(err),
      durationMs: Date.now() - start,
    };
  }
}
