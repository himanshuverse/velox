/**
 * Shared credential type definitions.
 * This file MUST NOT import any server-only modules (prisma, crypto, next/headers).
 * It is imported by both the tRPC router (server) and the client UI page.
 */

export const CREDENTIAL_TYPES = [
  "discord_webhook_url",
  "discord_bot_token",
  "slack_bot_token",
  "github_token",
  "notion_token",
  "resend_api_key",
  "openai_api_key",
  "google_oauth_refresh_token",
  "api_key",
  "webhook_secret",
] as const;

export type CredentialType = (typeof CREDENTIAL_TYPES)[number];
