import prisma from '@/lib/db';
import {  createTRPCRouter, protectedProcedure } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({
  getWorkflows: protectedProcedure
    .query(({ctx}) => {
      return prisma.user.findMany({
        where:{
          id:ctx.auth.user.id
        }
      })
    }),

  createWorkflow:protectedProcedure.mutation(async ()=>{

    await inngest.send({
      name:"app/task.created",
      data:{
        "email":"example.com"
      }
    })


    return prisma.workflow.create({
      data:{
        name:"test-workflow"
      }
    })
  })
});
// export type definition of API
export type AppRouter = typeof appRouter;