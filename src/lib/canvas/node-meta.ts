import {
  Zap,
  Globe,
  Clock,
  Send,
  MessageSquare,
  FileText,
  GitPullRequest,
  CheckSquare,
  Sparkles,
  GitBranch,
  Mail,
  Code2,
  MousePointer2,
  LucideIcon,
} from "lucide-react";
import { NodeSubtype, NodeType } from "@/lib/types/workflow";

export interface NodeMeta {
  type: NodeType;
  subtype: NodeSubtype;
  label: string;
  description: string;
  subtitle?: string;
  icon: LucideIcon;
  accentColor: string;
  accentBg?: string;
  iconColor?: string;
}

export const NODE_METAS: Record<string, NodeMeta> = {
  // Triggers
  manual: {
    type: "trigger",
    subtype: "manual",
    label: "Manual Trigger",
    description: "Trigger workflow manually",
    subtitle: "When clicking 'Execute workflow'",
    icon: MousePointer2,
    accentColor: "border-orange-500/40",
    iconColor: "text-orange-500",
  },
  webhook: {
    type: "trigger",
    subtype: "webhook",
    label: "Webhook",
    description: "Trigger on incoming HTTP payload",
    subtitle: "Incoming HTTP request",
    icon: Globe,
    accentColor: "border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
  schedule: {
    type: "trigger",
    subtype: "schedule",
    label: "Schedule",
    description: "Trigger on cron schedule",
    subtitle: "Every minute / hour",
    icon: Clock,
    accentColor: "border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
  github_push: {
    type: "trigger",
    subtype: "github_push",
    label: "GitHub Push",
    description: "Trigger on commits pushed to repository",
    icon: GitPullRequest,
    accentColor: "text-emerald-400 border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
  },
  github_pull_request: {
    type: "trigger",
    subtype: "github_pull_request",
    label: "GitHub Pull Request",
    description: "Trigger when PR is opened, closed, or merged",
    icon: GitPullRequest,
    accentColor: "text-emerald-400 border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
  },
  github_issue_opened: {
    type: "trigger",
    subtype: "github_issue_opened",
    label: "GitHub Issue Opened",
    description: "Trigger when a new issue is created",
    icon: GitPullRequest,
    accentColor: "text-emerald-400 border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
  },
  google_form_new_response: {
    type: "trigger",
    subtype: "google_form_new_response",
    label: "Google Form Response",
    description: "Trigger when a form response is submitted",
    icon: CheckSquare,
    accentColor: "text-emerald-400 border-emerald-500/40",
    accentBg: "bg-emerald-500/10",
  },

  // Actions
  http_request: {
    type: "action",
    subtype: "http_request",
    label: "HTTP Request",
    description: "Send a REST API request (GET, POST, PUT, DELETE)",
    subtitle: "Add URL",
    icon: Globe,
    accentColor: "border-neutral-700/80",
    iconColor: "text-neutral-300",
  },
  send_email: {
    type: "action",
    subtype: "send_email",
    label: "Send Email",
    description: "Send transactional email via Resend",
    icon: Mail,
    accentColor: "text-orange-400 border-orange-500/40",
    accentBg: "bg-orange-500/10",
  },
  discord_send_message: {
    type: "action",
    subtype: "discord_send_message",
    label: "Discord Message",
    description: "Post a message or embed to a Discord channel",
    icon: MessageSquare,
    accentColor: "text-blue-400 border-blue-500/40",
    accentBg: "bg-blue-500/10",
  },
  discord_create_thread: {
    type: "action",
    subtype: "discord_create_thread",
    label: "Discord Thread",
    description: "Create a discussion thread in a Discord channel",
    icon: MessageSquare,
    accentColor: "text-blue-400 border-blue-500/40",
    accentBg: "bg-blue-500/10",
  },
  slack_send_message: {
    type: "action",
    subtype: "slack_send_message",
    label: "Slack Message",
    description: "Post a message to a Slack channel or DM",
    icon: Send,
    accentColor: "text-yellow-400 border-yellow-500/40",
    accentBg: "bg-yellow-500/10",
  },
  slack_create_channel: {
    type: "action",
    subtype: "slack_create_channel",
    label: "Slack Channel",
    description: "Create a new public or private Slack channel",
    icon: Send,
    accentColor: "text-yellow-400 border-yellow-500/40",
    accentBg: "bg-yellow-500/10",
  },
  notion_create_page: {
    type: "action",
    subtype: "notion_create_page",
    label: "Notion Page",
    description: "Create a new page in a Notion database",
    icon: FileText,
    accentColor: "text-pink-400 border-pink-500/40",
    accentBg: "bg-pink-500/10",
  },
  notion_update_page: {
    type: "action",
    subtype: "notion_update_page",
    label: "Notion Update",
    description: "Update properties on an existing Notion page",
    icon: FileText,
    accentColor: "text-pink-400 border-pink-500/40",
    accentBg: "bg-pink-500/10",
  },
  notion_query_database: {
    type: "action",
    subtype: "notion_query_database",
    label: "Notion Query",
    description: "Query and filter records from a Notion database",
    icon: FileText,
    accentColor: "text-pink-400 border-pink-500/40",
    accentBg: "bg-pink-500/10",
  },
  github_create_issue: {
    type: "action",
    subtype: "github_create_issue",
    label: "GitHub Issue",
    description: "Create a new issue with labels and assignees",
    icon: GitPullRequest,
    accentColor: "text-purple-400 border-purple-500/40",
    accentBg: "bg-purple-500/10",
  },
  github_create_pr: {
    type: "action",
    subtype: "github_create_pr",
    label: "GitHub Pull Request",
    description: "Create a pull request against a repository",
    icon: GitPullRequest,
    accentColor: "text-purple-400 border-purple-500/40",
    accentBg: "bg-purple-500/10",
  },
  github_add_comment: {
    type: "action",
    subtype: "github_add_comment",
    label: "GitHub Comment",
    description: "Add a comment to an issue or pull request",
    icon: GitPullRequest,
    accentColor: "text-purple-400 border-purple-500/40",
    accentBg: "bg-purple-500/10",
  },
  google_forms_get_response: {
    type: "action",
    subtype: "google_forms_get_response",
    label: "Get Form Answers",
    description: "Retrieve question responses from Google Forms",
    icon: CheckSquare,
    accentColor: "text-green-400 border-green-500/40",
    accentBg: "bg-green-500/10",
  },

  // Condition
  condition: {
    type: "condition",
    subtype: "condition",
    label: "Condition (If/Else)",
    description: "Branch execution flow based on logical rules",
    icon: GitBranch,
    accentColor: "text-purple-400 border-purple-500/40",
    accentBg: "bg-purple-500/10",
  },

  // AI
  ai_prompt: {
    type: "ai",
    subtype: "ai_prompt",
    label: "AI Prompt",
    description: "Process or generate content using GPT-4o / Claude",
    icon: Sparkles,
    accentColor: "text-cyan-400 border-cyan-500/40",
    accentBg: "bg-cyan-500/10",
  },
};

export function getNodeMeta(subtype: string): NodeMeta {
  return (
    NODE_METAS[subtype] || {
      type: "action",
      subtype: subtype as NodeSubtype,
      label: subtype,
      description: "Custom Node Action",
      subtitle: "Execute action",
      icon: Code2,
      accentColor: "border-neutral-700",
      iconColor: "text-neutral-300",
    }
  );
}
