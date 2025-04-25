import { initTRPC, TRPCError } from '@trpc/server'
import type { CreateHTTPContextOptions } from '@trpc/server/adapters/standalone';
import { z } from 'zod';
import { PM2 } from './api.js';
import { env } from './env.js';
import { sign, verify } from './auth.js';

export const createContext = async ({ req }: CreateHTTPContextOptions) => ({
    auth: req.headers.authorization
});
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

const isAuthed = t.middleware(async ({ctx, next }) => {
    if (!ctx.auth?.startsWith('Bearer ')) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    try {
        const token = ctx.auth.split(' ')[1];
        const payload = await verify(token);
        return next({
            ctx: {
                ...ctx,
                isAdmin: payload
            }
        });
    } catch {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
});

export const authRouter = t.router({
    login: t.procedure
        .input(z.object({
            username: z.string(),
            password: z.string()
        }))
        .mutation(async ({ input }) => {
            const { username, password } = input;

            if (username !== env.ADMIN_USER || password !== env.ADMIN_PASS) {
                throw new TRPCError({ code: 'BAD_REQUEST'});
            }

            const token = await sign({ sub: username });
            return { token };
        })
})

export const statusRouter = t.router({
    start: t.procedure
        .use(isAuthed)
        .input(z.number())
        .mutation(async ({ input }) => {
            await PM2.action('start')(input);
            return { ok: true };
        }),
    stop: t.procedure
        .use(isAuthed)
        .input(z.number())
        .mutation(async ({ input }) => {
            await PM2.action('stop')(input);
            return { ok: true };
        }),
    restart: t.procedure
        .use(isAuthed)
        .input(z.number())
        .mutation(async ({ input }) => {
            await PM2.action('restart')(input);
            return { ok: true };
        })
});

export const appRouter = t.router({
    auth: authRouter,
    status: statusRouter
})

export type AppRouter = typeof appRouter;