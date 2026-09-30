import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

export const runRouter = createTRPCRouter({
  // 1. List runs (optionally filtered by workflowId and/or status)
  list: protectedProcedure
    .input(
      z.object({
        workflowId: z.string().optional(),
        status: z
          .enum(["all", "completed", "failed", "running", "pending"])
          .optional()
          .default("all"),
        limit: z.number().min(1).max(500).optional().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const whereClause: {
        workflow: { userId: string };
        workflowId?: string;
        status?: string;
      } = {
        workflow: { userId: ctx.auth.user.id },
      };

      if (input.workflowId) {
        whereClause.workflowId = input.workflowId;
      }

      if (input.status && input.status !== "all") {
        whereClause.status = input.status;
      }

      const runs = await prisma.workflowRun.findMany({
        where: whereClause,
        take: input.limit,
        orderBy: { startedAt: "desc" },
        select: {
          id: true,
          workflowId: true,
          status: true,
          trigger: true,
          error: true,
          startedAt: true,
          completedAt: true,
          logs: true,
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return runs;
    }),

  // 2. Get single run by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const run = await prisma.workflowRun.findFirst({
        where: {
          id: input.id,
          workflow: { userId: ctx.auth.user.id },
        },
        select: {
          id: true,
          workflowId: true,
          status: true,
          trigger: true,
          error: true,
          startedAt: true,
          completedAt: true,
          logs: true,
          workflow: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (!run) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Run not found or access denied",
        });
      }

      return run;
    }),

  // 3. Aggregate run stats for user
  stats: protectedProcedure
    .input(z.object({ workflowId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const whereClause: {
        workflow: { userId: string };
        workflowId?: string;
      } = {
        workflow: { userId: ctx.auth.user.id },
      };

      if (input?.workflowId) {
        whereClause.workflowId = input.workflowId;
      }

      const [total, completed, failed, running] = await Promise.all([
        prisma.workflowRun.count({ where: whereClause }),
        prisma.workflowRun.count({
          where: { ...whereClause, status: "completed" },
        }),
        prisma.workflowRun.count({
          where: { ...whereClause, status: "failed" },
        }),
        prisma.workflowRun.count({
          where: { ...whereClause, status: "running" },
        }),
      ]);

      const successRate = total > 0 ? Math.round((completed / total) * 100) : 100;

      return {
        total,
        completed,
        failed,
        running,
        successRate,
      };
    }),

  // 4. Delete a run
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const run = await prisma.workflowRun.findFirst({
        where: {
          id: input.id,
          workflow: { userId: ctx.auth.user.id },
        },
      });

      if (!run) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Run not found",
        });
      }

      await prisma.workflowRun.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
