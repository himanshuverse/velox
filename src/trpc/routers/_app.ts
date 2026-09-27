import { createTRPCRouter } from '../init';
import { workflowRouter } from './workflow';
import { credentialRouter } from './credential';

export const appRouter = createTRPCRouter({
  workflow: workflowRouter,
  credential: credentialRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;