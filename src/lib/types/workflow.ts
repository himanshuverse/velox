import { z } from "zod";

export type NodeType = "trigger" | "action" | "condition" | "ai";

export type TriggerType =
    | "manual"
    | "webhook"
    | "schedule"
    | "notion_database_new_entry"
    | "slack_slash_command"
    | "slack_event_message"
    | "discord_webhook_trigger"
    | "github_push"
    | "github_pull_request"
    | "github_issue_opened"
    | "google_form_new_response";

export type ActionType =
    | "http_request"
    | "send_email"
    | "discord_send_message"
    | "discord_create_thread"
    | "slack_send_message"
    | "slack_create_channel"
    | "notion_create_page"
    | "notion_update_page"
    | "notion_query_database"
    | "github_create_issue"
    | "github_create_pr"
    | "github_add_label"
    | "github_add_comment"
    | "google_forms_get_response";

export type ConditionType = "condition";
export type AiType = "ai_prompt";

export type NodeSubtype = TriggerType | ActionType | ConditionType | AiType;

export interface WorkflowNode {
    id: string;
    type: NodeType;
    subtype: NodeSubtype;
    label: string;
    config: Record<string, unknown>;
    position: { x: number; y: number };
}

export interface WorkflowEdge {
    id: string;
    source: string;      // source node ID
    target: string;      // target node ID
    sourceHandle?: string;
    targetHandle?: string;
}

export type WorkflowStatus = "draft" | "active" | "paused";
export type WorkflowRunStatus = "pending" | "running" | "completed" | "failed";

// Zod validation schemas for tRPC & API input

// 1. Single Node & Edge Validators
export const workflowNodeSchema = z.object({
    id: z.string(),
    type: z.enum(["trigger", "action", "condition", "ai"]),
    subtype: z.string(),
    label: z.string(),
    config: z.record(z.unknown()).default({}),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }),
});


export const workflowEdgeSchema = z.object({
    id: z.string(),
    source: z.string(),
    target: z.string(),
    sourceHandle: z.string().optional(),
    targetHandle: z.string().optional(),
});


// 2. Create Workflow Input (Modal Form)

export const createWorkflowSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    description: z.string().max(500, "Description is too long").optional(),
});


// 3. Update Workflow Input (Canvas Auto-Save & Settings)

export const updateWorkflowSchema = z.object({
    id: z.string(),
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional().nullable(),
    status: z.enum(["draft", "active", "paused"]).optional(),
    nodes: z.array(workflowNodeSchema).optional(),
    edges: z.array(workflowEdgeSchema).optional(),
});


// 4. ID-Only Inputs (Delete, Duplicate, GetById)
export const workflowIdSchema = z.object({
    id: z.string(),
});