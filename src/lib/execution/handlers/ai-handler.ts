import type { WorkflowNode } from "@/lib/types/workflow";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";
import { resolveTemplate } from "../template-resolver";

interface AiConfig {
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
}

export async function executeAiPrompt(
  node: WorkflowNode,
  context: NodeExecutionContext
): Promise<NodeExecutionResult["output"]> {
  const config = (node.config ?? {}) as AiConfig;
  const model = config.model ?? "gpt-4o";
  const systemPrompt = resolveTemplate(config.systemPrompt ?? "", context);
  const userPrompt = resolveTemplate(config.userPrompt ?? "", context);

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
            { role: "user", content: userPrompt || "Hello" },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      return {
        model,
        completion: data.choices?.[0]?.message?.content ?? "",
        usage: data.usage,
      };
    } catch (err: any) {
      throw new Error(`AI generation failed: ${err.message}`);
    }
  }

  // Graceful fallback for development when no OpenAI key is configured
  return {
    model,
    completion: `[Simulated AI Response for "${model}"] Processed prompt: ${userPrompt.slice(0, 100)}...`,
    simulated: true,
    note: "Add OPENAI_API_KEY to your .env to enable live AI responses.",
  };
}
