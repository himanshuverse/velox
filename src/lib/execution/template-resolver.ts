import type { NodeExecutionContext } from "./types";

export function resolveTemplate(
    template: string,
    context: NodeExecutionContext
): string {
    return template.replace(/\{\{([\w.]+)\}\}/g, (_, path: string) => {
        const [nodeId, ...keys] = path.split(".");
        let val = context[nodeId];
        for (const key of keys) val = (val as Record<string, unknown>)?.[key];
        return val !== undefined ? String(val) : `{{${path}}}`;
    });
}