"use client";

import { useState } from "react";
import { Node } from "@xyflow/react";
import {
  X,
  Trash2,
  Copy,
  Check,
  Code2,
  Globe,
  Clock,
  Mail,
  MessageSquare,
  Send,
  GitBranch,
  Sparkles,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getNodeMeta } from "@/lib/canvas/node-meta";
import { NodeData } from "@/components/canvas/nodes/trigger-node";

interface NodeConfigPanelProps {
  node: Node | null;
  workflowId: string;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: { label?: string; config?: Record<string, unknown> }) => void;
  onDeleteNode: (nodeId: string) => void;
}

export function NodeConfigPanel({
  node,
  workflowId,
  onClose,
  onUpdateNode,
  onDeleteNode,
}: NodeConfigPanelProps) {
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  if (!node) return null;

  const nodeData = node.data as NodeData;
  const meta = getNodeMeta(nodeData.subtype || "manual");
  const config = (nodeData.config || {}) as Record<string, any>;
  const Icon = meta.icon;

  const handleConfigChange = (key: string, value: any) => {
    onUpdateNode(node.id, {
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  const handleLabelChange = (newLabel: string) => {
    onUpdateNode(node.id, {
      label: newLabel,
    });
  };

  const copyWebhookUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/api/webhooks/${workflowId}`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <aside className="relative flex h-full min-h-0 w-80 sm:w-96 shrink-0 flex-col border-l border-neutral-800/80 bg-[#151922]/95 backdrop-blur-md z-20 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-800/80 px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800">
            <Icon className={`h-4 w-4 ${meta.iconColor || "text-neutral-300"}`} />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-semibold leading-none">
              {meta.type}
            </div>
            <div className="text-xs font-semibold text-white truncate mt-0.5">
              {meta.label}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDeleteNode(node.id)}
            className="h-8 w-8 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10"
            title="Delete Node"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-neutral-800"
            title="Close Panel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Configuration Form Body (Isolated Scroll Area) */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="space-y-5 pb-6">
          {/* General: Node Label */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
              Step Label
            </label>
            <Input
              value={nodeData.label || meta.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 focus-visible:ring-orange-500/50"
              placeholder="e.g. Fetch GitHub Commits"
            />
          </div>

          {/* Subtype-Specific Configuration */}

          {/* 1. HTTP REQUEST */}
          {nodeData.subtype === "http_request" && (
            <div className="space-y-4 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  HTTP Method
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {["GET", "POST", "PUT", "PATCH", "DELETE"].map((method) => {
                    const isSelected = (config.method || "GET") === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => handleConfigChange("method", method)}
                        className={`rounded py-1 text-[10px] font-mono font-bold transition-colors ${
                          isSelected
                            ? "bg-orange-600 text-white shadow-sm"
                            : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-neutral-200"
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Endpoint URL
                </label>
                <Input
                  value={config.url || ""}
                  onChange={(e) => handleConfigChange("url", e.target.value)}
                  placeholder="https://api.example.com/v1/data"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 font-mono focus-visible:ring-orange-500/50"
                />
              </div>

              {/* JSON Body (for POST, PUT, PATCH) */}
              {["POST", "PUT", "PATCH"].includes(config.method || "GET") && (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                    JSON Body Payload
                  </label>
                  <Textarea
                    rows={5}
                    value={config.body || ""}
                    onChange={(e) => handleConfigChange("body", e.target.value)}
                    placeholder={'{\n  "key": "value"\n}'}
                    className="bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 font-mono focus-visible:ring-orange-500/50 resize-y"
                  />
                </div>
              )}
            </div>
          )}

          {/* 2. INCOMING WEBHOOK */}
          {nodeData.subtype === "webhook" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 space-y-2">
                <div className="text-xs font-semibold text-neutral-200">
                  Unique Webhook URL
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={`/api/webhooks/${workflowId}`}
                    className="h-8 bg-neutral-950 border-neutral-800 text-[11px] font-mono text-emerald-400 select-all"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyWebhookUrl}
                    className="h-8 px-2.5 border-neutral-800 text-neutral-300 hover:text-white"
                  >
                    {copiedWebhook ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                <p className="text-[11px] text-neutral-500">
                  Send a POST request with JSON payload to this endpoint to trigger execution.
                </p>
              </div>
            </div>
          )}

          {/* 3. CRON SCHEDULE */}
          {nodeData.subtype === "schedule" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Schedule Presets
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Every Minute", cron: "* * * * *" },
                  { label: "Every 15 Minutes", cron: "*/15 * * * *" },
                  { label: "Every Hour", cron: "0 * * * *" },
                  { label: "Daily (Midnight)", cron: "0 0 * * *" },
                ].map((preset) => (
                  <button
                    key={preset.cron}
                    type="button"
                    onClick={() => handleConfigChange("cron", preset.cron)}
                    className={`rounded-lg p-2 text-left border transition-all ${
                      config.cron === preset.cron
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-300"
                        : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <div className="text-xs font-semibold">{preset.label}</div>
                    <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                      {preset.cron}
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Custom Cron Expression
                </label>
                <Input
                  value={config.cron || "* * * * *"}
                  onChange={(e) => handleConfigChange("cron", e.target.value)}
                  placeholder="* * * * *"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs font-mono text-emerald-400 focus-visible:ring-emerald-500/50"
                />
              </div>
            </div>
          )}

          {/* 4. SEND EMAIL */}
          {nodeData.subtype === "send_email" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  To (Recipient Email)
                </label>
                <Input
                  type="email"
                  value={config.to || ""}
                  onChange={(e) => handleConfigChange("to", e.target.value)}
                  placeholder="user@example.com"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Subject Line
                </label>
                <Input
                  value={config.subject || ""}
                  onChange={(e) => handleConfigChange("subject", e.target.value)}
                  placeholder="Notification: Task Completed"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Email Body (Markdown supported)
                </label>
                <Textarea
                  rows={4}
                  value={config.body || ""}
                  onChange={(e) => handleConfigChange("body", e.target.value)}
                  placeholder="Hi there,\n\nYour workflow executed successfully!"
                  className="bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 resize-y"
                />
              </div>
            </div>
          )}

          {/* 5. DISCORD MESSAGE */}
          {nodeData.subtype === "discord_send_message" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Discord Webhook URL
                </label>
                <Input
                  value={config.webhookUrl || ""}
                  onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Bot Username (Optional)
                </label>
                <Input
                  value={config.username || ""}
                  onChange={(e) => handleConfigChange("username", e.target.value)}
                  placeholder="Velox Bot"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Message Content
                </label>
                <Textarea
                  rows={4}
                  value={config.content || ""}
                  onChange={(e) => handleConfigChange("content", e.target.value)}
                  placeholder="New commit pushed to main branch! :rocket:"
                  className="bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 resize-y"
                />
              </div>
            </div>
          )}

          {/* 6. SLACK MESSAGE */}
          {nodeData.subtype === "slack_send_message" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Slack Webhook URL
                </label>
                <Input
                  value={config.webhookUrl || ""}
                  onChange={(e) => handleConfigChange("webhookUrl", e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Channel (Optional)
                </label>
                <Input
                  value={config.channel || ""}
                  onChange={(e) => handleConfigChange("channel", e.target.value)}
                  placeholder="#alerts"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Message Text
                </label>
                <Textarea
                  rows={4}
                  value={config.text || ""}
                  onChange={(e) => handleConfigChange("text", e.target.value)}
                  placeholder="Pipeline finished with exit code 0."
                  className="bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 resize-y"
                />
              </div>
            </div>
          )}

          {/* 7. CONDITION LOGIC */}
          {nodeData.subtype === "condition" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Left Value / Variable
                </label>
                <Input
                  value={config.leftOperand || ""}
                  onChange={(e) => handleConfigChange("leftOperand", e.target.value)}
                  placeholder="e.g. {{http_1.status}}"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs font-mono text-purple-300"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Operator
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: "==", value: "equals" },
                    { label: "!=", value: "not_equals" },
                    { label: ">", value: "greater_than" },
                    { label: "<", value: "less_than" },
                    { label: "Contains", value: "contains" },
                    { label: "Is Empty", value: "is_empty" },
                  ].map((op) => (
                    <button
                      key={op.value}
                      type="button"
                      onClick={() => handleConfigChange("operator", op.value)}
                      className={`rounded py-1 text-[10px] font-mono font-bold transition-colors ${
                        (config.operator || "equals") === op.value
                          ? "bg-purple-600 text-white"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white"
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Right Value
                </label>
                <Input
                  value={config.rightOperand || ""}
                  onChange={(e) => handleConfigChange("rightOperand", e.target.value)}
                  placeholder="e.g. 200"
                  className="h-8.5 bg-neutral-900/90 border-neutral-800 text-xs font-mono text-neutral-100"
                />
              </div>
            </div>
          )}

          {/* 8. AI PROMPT */}
          {nodeData.subtype === "ai_prompt" && (
            <div className="space-y-3 pt-2 border-t border-neutral-800/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  AI Model
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {["GPT-4o", "Claude 3.5 Sonnet"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleConfigChange("model", m)}
                      className={`rounded-lg p-2 text-left border transition-all ${
                        (config.model || "GPT-4o") === m
                          ? "bg-cyan-500/10 border-cyan-500/50 text-cyan-300"
                          : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      <div className="text-xs font-semibold">{m}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  System Instructions
                </label>
                <Textarea
                  rows={2}
                  value={config.systemPrompt || ""}
                  onChange={(e) => handleConfigChange("systemPrompt", e.target.value)}
                  placeholder="You are an automation assistant that extracts key takeaways."
                  className="bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 resize-y"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  User Prompt Template
                </label>
                <Textarea
                  rows={4}
                  value={config.userPrompt || ""}
                  onChange={(e) => handleConfigChange("userPrompt", e.target.value)}
                  placeholder="Summarize the following incident report:\n{{webhook_1.body}}"
                  className="bg-neutral-900/90 border-neutral-800 text-xs text-neutral-100 font-mono resize-y"
                />
              </div>
            </div>
          )}

          {/* 9. MANUAL TRIGGER */}
          {nodeData.subtype === "manual" && (
            <div className="space-y-2 pt-2 border-t border-neutral-800/80">
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-3 space-y-2">
                <div className="text-xs font-semibold text-neutral-200">
                  Manual Execution
                </div>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  This trigger starts the workflow whenever you click the <strong>Run</strong> button in the top toolbar or trigger it via the API.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
