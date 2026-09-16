import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { runWorkflow } from "@/inngest/function";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [runWorkflow],
});