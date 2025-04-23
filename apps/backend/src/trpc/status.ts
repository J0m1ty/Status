import { initTRPC } from '@trpc/server'
import { type Context } from './context.js';
import { z } from 'zod';
import { action, connect, disconnect } from '../pm2/api.js';

const t = initTRPC.context<Context>().create();

export const statusRouter = t.router({
    restart: t.procedure
        .input(z.number())
        .mutation(async ({ input }) => {
            await connect();
            await action('restart')(input);
            await disconnect();

            return { ok: true };
        })
});

export type StatusRouter = typeof statusRouter;