import { createWorkflowSchema, updateWorkflowSchema, workflowIdSchema } from "@/lib/types/workflow";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { Prisma } from "@/generated/prisma/client"

export const workflowRouter = createTRPCRouter({

    //1. list all the workflow for current user
    list: protectedProcedure.query(async ({ ctx }) => {
        return prisma.workflow.findMany({
            where: {
                userId: ctx.auth.user.id
            },
            orderBy: { updatedAt: "desc" },
            select: {
                id: true,
                name: true,
                description: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        runs: true,
                    },
                },
            },
        });
    }),

    //2.get single workflow by id (with ownership check)
    getById: protectedProcedure
        .input(workflowIdSchema)
        .query(async ({ ctx, input }) => {
            const workflow = await prisma.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.auth.user.id
                },
                include: {
                    runs: {
                        take: 5,
                        orderBy: {
                            startedAt: "desc"
                        }
                    }
                }
            })

            if (!workflow) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Workflow not found or access denied",
                })
            }

            return workflow;
        }),

    //3.create new empty workflow
    create: protectedProcedure
        .input(createWorkflowSchema)
        .mutation(async ({ ctx, input }) => {
            return prisma.workflow.create({
                data: {
                    name: input.name,
                    description: input.description,
                    status: "draft",
                    nodes: [],
                    edges: [],
                    userId: ctx.auth.user.id
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })
        }),

    //4. update the workflow or canvas state
    update: protectedProcedure
        .input(updateWorkflowSchema)
        .mutation(async ({ ctx, input }) => {
            const existing = await prisma.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.auth.user.id
                }
            })
            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Workflow not found or access denied",
                })
            }

            return prisma.workflow.update({
                where: {
                    id: input.id
                },
                data: {
                    ...(input.name !== undefined && { name: input.name }),
                    ...(input.description !== undefined && { description: input.description }),
                    ...(input.status !== undefined && { status: input.status }),
                    ...(input.nodes !== undefined && { nodes: input.nodes as unknown as Prisma.InputJsonValue }),
                    ...(input.edges !== undefined && { edges: input.edges as unknown as Prisma.InputJsonValue }),
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    updatedAt: true,
                },
            })
        }),

    //5.delete the workflow
    delete: protectedProcedure
        .input(workflowIdSchema)
        .mutation(async ({ ctx, input }) => {
            const existing = await prisma.workflow.findFirst({
                where: {
                    id: input.id,
                    userId: ctx.auth.user.id
                }
            });

            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "workflow not found"
                })
            }

            return prisma.workflow.delete({
                where: {
                    id: input.id
                },
                select: {
                    id: true,
                },
            })
        }),

    // 6. duplicate the workflow
    duplicate: protectedProcedure
        .input(workflowIdSchema)
        .mutation(async ({ ctx, input }) => {
            const original = await prisma.workflow.findFirst({
                where: { id: input.id, userId: ctx.auth.user.id },
            });

            if (!original) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Workflow not found",
                });
            }

            return prisma.workflow.create({
                data: {
                    name: `${original.name} (Copy)`,
                    description: original.description,
                    status: "draft",
                    nodes: original.nodes ?? [],
                    edges: original.edges ?? [],
                    userId: ctx.auth.user.id,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        })


})
