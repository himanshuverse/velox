import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import prisma from "@/lib/db";
import { TRPCError } from "@trpc/server";
import { encrypt, decrypt } from "@/lib/crypto";
import { CREDENTIAL_TYPES, type CredentialType } from "@/lib/types/credential";

const createCredentialSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  type: z.enum(CREDENTIAL_TYPES),
  value: z.string().min(1, "Value is required"),
});

const updateCredentialSchema = z.object({
  id: z.string().cuid(),
  name: z.string().min(1).max(100).optional(),
  value: z.string().min(1).optional(),
});

const credentialIdSchema = z.object({
  id: z.string().cuid(),
});

// ─── Router ─────────────────────────────────────────────────────────────────

export const credentialRouter = createTRPCRouter({

  // 1. List all credentials for the current user (never expose the value)
  list: protectedProcedure.query(async ({ ctx }) => {
    return prisma.credential.findMany({
      where: { userId: ctx.auth.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        // value and iv are NEVER returned to the client
      },
    });
  }),

  // 2. Create a new credential (encrypts the value before storing)
  create: protectedProcedure
    .input(createCredentialSchema)
    .mutation(async ({ ctx, input }) => {
      // Check name uniqueness for this user
      const existing = await prisma.credential.findUnique({
        where: { userId_name: { userId: ctx.auth.user.id, name: input.name } },
      });
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A credential named "${input.name}" already exists.`,
        });
      }

      const { ciphertext, iv } = encrypt(input.value);

      return prisma.credential.create({
        data: {
          name: input.name,
          type: input.type,
          value: ciphertext,
          iv,
          userId: ctx.auth.user.id,
        },
        select: { id: true, name: true, type: true, createdAt: true },
      });
    }),

  // 3. Update a credential's name and/or rotate its value
  update: protectedProcedure
    .input(updateCredentialSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.credential.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      }

      const data: Record<string, unknown> = {};
      if (input.name) data.name = input.name;
      if (input.value) {
        const { ciphertext, iv } = encrypt(input.value);
        data.value = ciphertext;
        data.iv = iv;
      }

      return prisma.credential.update({
        where: { id: input.id },
        data,
        select: { id: true, name: true, type: true, updatedAt: true },
      });
    }),

  // 4. Delete a credential
  delete: protectedProcedure
    .input(credentialIdSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.credential.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      }

      return prisma.credential.delete({
        where: { id: input.id },
        select: { id: true },
      });
    }),

  // 5. Resolve (decrypt) a credential value — used server-side by the execution engine
  // This procedure returns the decrypted value ONLY to be called server-side
  resolve: protectedProcedure
    .input(credentialIdSchema)
    .query(async ({ ctx, input }) => {
      const credential = await prisma.credential.findFirst({
        where: { id: input.id, userId: ctx.auth.user.id },
      });
      if (!credential) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Credential not found." });
      }

      const decrypted = decrypt(credential.value, credential.iv);
      return { id: credential.id, name: credential.name, type: credential.type, value: decrypted };
    }),
});
