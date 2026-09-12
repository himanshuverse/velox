import type { WorkflowNode } from "@/lib/types/workflow";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";
import { resolveTemplate } from "../template-resolver";

interface HttpConfig {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: string;
}

export async function executeHttpRequest(
    node: WorkflowNode,
    context: NodeExecutionContext
): Promise<NodeExecutionResult["output"]> {
    const config = node.config as HttpConfig;

    const method = (config.method ?? "GET").toUpperCase();
    const url = resolveTemplate(config.url ?? "", context);

    if (!url) {
        throw new Error("HTTP Request node is missing a URL");
    }

    const headers: Record<string, string> = {};
    if (config.headers) {
        for (const [key, value] of Object.entries(config.headers)) {
            headers[key] = resolveTemplate(String(value), context);
        }
    }

    let body: string | undefined;
    if (config.body && method !== "GET") {
        body = resolveTemplate(config.body, context);
    }

    const response = await fetch(url, { method, headers, body });

    const responseBody = await response.text();

    let parsedBody: unknown;
    try {
        parsedBody = JSON.parse(responseBody);
    } catch {
        parsedBody = responseBody;
    }

    return {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: parsedBody,
    };
}