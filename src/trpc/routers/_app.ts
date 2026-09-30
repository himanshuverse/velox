import { createTRPCRouter } from '../init';
import { workflowRouter } from './workflow';
import { credentialRouter } from './credential';
import { runRouter } from './run';

export const appRouter = createTRPCRouter({
  workflow: workflowRouter,
  credential: credentialRouter,
  run: runRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
