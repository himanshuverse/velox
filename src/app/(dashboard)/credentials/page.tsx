"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  KeyRound,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Webhook,
  Bot,
  GitBranch,
  BookOpen,
  Mail,
  Sparkles,
  Globe,
  Lock,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CREDENTIAL_TYPES, type CredentialType } from "@/lib/types/credential";

// ─── Metadata ────────────────────────────────────────────────────────────────

const CREDENTIAL_META: Record<
  CredentialType,
  { label: string; description: string; icon: React.ComponentType<{ className?: string }>; color: string; placeholder: string }
> = {
  discord_webhook_url: {
    label: "Discord Webhook URL",
    description: "Webhook URL from a Discord channel's Integrations settings",
    icon: Webhook,
    color: "text-indigo-400",
    placeholder: "https://discord.com/api/webhooks/...",
  },
  discord_bot_token: {
    label: "Discord Bot Token",
    description: "Token for a Discord bot from the Discord Developer Portal",
    icon: Bot,
    color: "text-indigo-400",
    placeholder: "MTI3...NjQ.G...",
  },
  slack_bot_token: {
    label: "Slack Bot Token",
    description: "OAuth Bot Token from your Slack App (xoxb-...)",
    icon: Bot,
    color: "text-emerald-400",
    placeholder: "xoxb-...",
  },
  github_token: {
    label: "GitHub Token",
    description: "Personal Access Token from github.com/settings/tokens",
    icon: GitBranch,
    color: "text-neutral-300",
    placeholder: "ghp_...",
  },
  notion_token: {
    label: "Notion Token",
    description: "Integration Token from notion.so/my-integrations",
    icon: BookOpen,
    color: "text-neutral-300",
    placeholder: "ntn_...",
  },
  resend_api_key: {
    label: "Resend API Key",
    description: "API Key from your Resend dashboard",
    icon: Mail,
    color: "text-blue-400",
    placeholder: "re_...",
  },
  openai_api_key: {
    label: "OpenAI API Key",
    description: "Secret key from platform.openai.com/api-keys",
    icon: Sparkles,
    color: "text-green-400",
    placeholder: "sk-...",
  },
  google_oauth_refresh_token: {
    label: "Google OAuth Refresh Token",
    description: "Refresh token from Google OAuth2 flow",
    icon: Globe,
    color: "text-yellow-400",
    placeholder: "1//04...",
  },
  api_key: {
    label: "API Key",
    description: "Generic API key for any HTTP service",
    icon: KeyRound,
    color: "text-orange-400",
    placeholder: "your-api-key",
  },
  webhook_secret: {
    label: "Webhook Secret",
    description: "HMAC secret for verifying incoming webhooks",
    icon: Shield,
    color: "text-purple-400",
    placeholder: "whsec_...",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function MaskedValue() {
  return (
    <span className="font-mono text-sm tracking-widest text-neutral-500 select-none">
      ••••••••••••••••
    </span>
  );
}

// ─── Add / Edit Dialog ───────────────────────────────────────────────────────

interface CredentialDialogProps {
  open: boolean;
  onClose: () => void;
  editId?: string | null;
}

function CredentialDialog({ open, onClose, editId }: CredentialDialogProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const isEdit = !!editId;

  const [name, setName] = useState("");
  const [type, setType] = useState<CredentialType>("api_key");
  const [value, setValue] = useState("");
  const [showValue, setShowValue] = useState(false);

  const createMutation = useMutation(
    trpc.credential.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.credential.list.queryFilter());
        toast.success("Credential saved");
        onClose();
        setName(""); setType("api_key"); setValue("");
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const updateMutation = useMutation(
    trpc.credential.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.credential.list.queryFilter());
        toast.success("Credential updated");
        onClose();
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const isPending = createMutation.isPending || updateMutation.isPending;
  const meta = CREDENTIAL_META[type];
  const Icon = meta.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;
    if (isEdit && editId) {
      updateMutation.mutate({ id: editId, name: name.trim(), value: value.trim() });
    } else {
      createMutation.mutate({ name: name.trim(), type, value: value.trim() });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md bg-neutral-950 border border-neutral-800 text-neutral-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600/20 border border-orange-500/30">
              <KeyRound className="h-4 w-4 text-orange-400" />
            </div>
            {isEdit ? "Update Credential" : "Add Credential"}
          </DialogTitle>
          <DialogDescription className="text-neutral-400">
            {isEdit
              ? "Update the name or rotate the secret value."
              : "Credentials are encrypted at rest using AES-256-GCM."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Name
            </label>
            <Input
              placeholder="e.g. My Discord Webhook"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500/50"
              autoFocus
            />
          </div>

          {/* Type — only for new */}
          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Type
              </label>
              <Select value={type} onValueChange={(v) => setType(v as CredentialType)}>
                <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-700 text-neutral-100">
                  {CREDENTIAL_TYPES.map((t) => {
                    const m = CREDENTIAL_META[t];
                    const TIcon = m.icon;
                    return (
                      <SelectItem key={t} value={t} className="focus:bg-neutral-800">
                        <div className="flex items-center gap-2">
                          <TIcon className={`h-3.5 w-3.5 ${m.color}`} />
                          <span>{m.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-neutral-500 mt-1 flex items-start gap-1.5">
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${meta.color}`} />
                {meta.description}
              </p>
            </div>
          )}

          {/* Value */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
              Secret Value
            </label>
            <div className="relative">
              <Input
                type={showValue ? "text" : "password"}
                placeholder={meta.placeholder}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-500/50 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowValue((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
              >
                {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Encryption notice */}
          <div className="flex items-center gap-2 rounded-lg bg-neutral-900/80 border border-neutral-800 px-3 py-2">
            <Lock className="h-3.5 w-3.5 text-green-400 shrink-0" />
            <p className="text-xs text-neutral-400">
              Encrypted with AES-256-GCM before being stored. The raw value is never logged or returned after saving.
            </p>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !name.trim() || !value.trim()}
              className="bg-orange-600 hover:bg-orange-500 text-white"
            >
              {isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : isEdit ? (
                "Update"
              ) : (
                "Save Credential"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CredentialsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const listQuery = useQuery(trpc.credential.list.queryOptions());
  const credentials = listQuery.data ?? [];

  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const deleteMutation = useMutation(
    trpc.credential.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.credential.list.queryFilter());
        toast.success("Credential deleted");
        setDeleteId(null);
      },
      onError: (e) => toast.error(e.message),
    })
  );

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const credToDelete = credentials.find((c) => c.id === deleteId);

  return (
    <div className="flex flex-col h-full min-h-0 bg-neutral-950 text-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800/80 px-6 py-4 shrink-0">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600/20 border border-orange-500/30">
              <KeyRound className="h-4 w-4 text-orange-400" />
            </div>
            Credentials
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Securely store API keys and tokens used by your workflow nodes.
          </p>
        </div>
        <Button
          onClick={() => setAddOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Credential
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {listQuery.isLoading ? (
          // Skeleton
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 rounded-xl bg-neutral-900/60 border border-neutral-800/60 animate-pulse"
              />
            ))}
          </div>
        ) : credentials.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 mb-4">
              <Shield className="h-8 w-8 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No credentials yet</h3>
            <p className="text-sm text-neutral-400 mb-6 max-w-sm">
              Add API keys and tokens here. They are encrypted and can be referenced
              in your workflow node configurations.
            </p>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              Add your first credential
            </Button>
          </div>
        ) : (
          // Credentials list
          <div className="space-y-3 max-w-3xl">
            {credentials.map((cred) => {
              const meta = CREDENTIAL_META[cred.type as CredentialType] ?? CREDENTIAL_META.api_key;
              const Icon = meta.icon;

              return (
                <div
                  key={cred.id}
                  className="group relative flex items-center gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/60 px-5 py-4 hover:border-neutral-700/80 hover:bg-neutral-900/80 transition-all"
                >
                  {/* Icon */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-900 border border-neutral-800`}>
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white truncate">{cred.name}</span>
                      <Badge
                        variant="secondary"
                        className="bg-neutral-800/80 text-neutral-400 border-neutral-700/60 text-xs shrink-0"
                      >
                        {meta.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <MaskedValue />
                      <span className="text-xs text-neutral-600">
                        Added {formatDate(cred.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Copy ID button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
                      title="Copy credential ID (use in node config)"
                      onClick={() => handleCopyId(cred.id)}
                    >
                      {copiedId === cred.id ? (
                        <Check className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    {/* Rotate (update) */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800"
                      title="Rotate secret"
                      onClick={() => setEditId(cred.id)}
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-neutral-500 hover:text-red-400 hover:bg-red-500/10"
                      title="Delete credential"
                      onClick={() => setDeleteId(cred.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Usage hint */}
            <div className="flex items-start gap-3 rounded-xl border border-neutral-800/40 bg-neutral-900/30 px-4 py-3 mt-4">
              <AlertCircle className="h-4 w-4 text-neutral-500 mt-0.5 shrink-0" />
              <p className="text-xs text-neutral-500 leading-relaxed">
                <span className="text-neutral-400 font-medium">How to use:</span> Click the copy icon (
                <Copy className="inline h-3 w-3" />) next to any credential to copy its ID.
                Paste that ID into the credential selector in your node's configuration panel.
                The execution engine will decrypt and inject the value at runtime.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <CredentialDialog
        open={addOpen || !!editId}
        onClose={() => { setAddOpen(false); setEditId(null); }}
        editId={editId}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="bg-neutral-950 border border-neutral-800 text-neutral-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              Delete Credential
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              Are you sure you want to delete{" "}
              <span className="text-white font-semibold">"{credToDelete?.name}"</span>?
              Any workflow nodes referencing this credential will fail to execute.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate({ id: deleteId })}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              {deleteMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
