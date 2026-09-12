export interface NodeExecutionContext {
    [nodeId: string]: unknown;
}

export interface NodeExecutionResult {
    status: "success" | "failed" | "skipped";
    output: unknown;
    error?: string;
    durationMs: number;
}