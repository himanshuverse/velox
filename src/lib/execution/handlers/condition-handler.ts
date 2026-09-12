import type { WorkflowNode } from "@/lib/types/workflow";
import type { NodeExecutionContext, NodeExecutionResult } from "../types";
import { resolveTemplate } from "../template-resolver";

interface ConditionConfig {
    leftOperand?: string;
    operator?: string;
    rightOperand?: string;
}

function resolveOperand(
    operand: string,
    context: NodeExecutionContext
): unknown {
    const trimmed = operand.trim();

    if (trimmed.startsWith("{{") && trimmed.endsWith("}}")) {
        const path = trimmed.slice(2, -2);
        const [nodeId, ...keys] = path.split(".");
        let val = context[nodeId];
        for (const key of keys) val = (val as Record<string, unknown>)?.[key];
        return val;
    }

    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    if (trimmed === "null" || trimmed === "undefined") return null;
    if (!Number.isNaN(Number(trimmed))) return Number(trimmed);

    return trimmed;
}

function evaluate(
    left: unknown,
    operator: string,
    right: unknown
): boolean {
    const leftStr = String(left ?? "");
    const rightStr = String(right ?? "");

    switch (operator) {
        case "==":
            return left == right;
        case "!=":
            return left != right;
        case ">":
            return Number(left) > Number(right);
        case "<":
            return Number(left) < Number(right);
        case ">=":
            return Number(left) >= Number(right);
        case "<=":
            return Number(left) <= Number(right);
        case "contains":
            return leftStr.includes(rightStr);
        case "is_empty":
            return !leftStr || leftStr.length === 0;
        default:
            throw new Error(`Unknown condition operator: ${operator}`);
    }
}

export async function executeCondition(
    node: WorkflowNode,
    context: NodeExecutionContext
): Promise<NodeExecutionResult["output"]> {
    const config = node.config as ConditionConfig;

    const leftRaw = config.leftOperand ?? "";
    const operator = config.operator ?? "==";
    const rightRaw = config.rightOperand ?? "";

    const left = resolveOperand(leftRaw, context);
    const right = resolveOperand(rightRaw, context);

    const passed = evaluate(left, operator, right);

    return { passed, left, right, operator };
}