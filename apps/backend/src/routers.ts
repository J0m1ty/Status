import { initTRPC } from '@trpc/server'
import { z } from 'zod';
import { PM2 } from './api.js';
import { env } from './env.js';
import { sign } from './auth.js';

export const createContext = async () => ({});
export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const authRouter = t.router({
    login: t.procedure
        .input(z.object({
            username: z.string(),
            password: z.string()
        }))
        .mutation(async ({ input }) => {
            const { username, password } = input;

            if (username !== env.ADMIN_USER || password !== env.ADMIN_PASS) {
                throw new Error('Invalid credentials');
            }

            const token = await sign({ sub: username });
            return { token };
        })
})

export const statusRouter = t.router({
    start: t.procedure
        .input(z.number())
        .mutation(async ({ input }) => {
            await PM2.action('start')(input);

            return { ok: true };
        }),
    stop: t.procedure
        .input(z.number())
        .mutation(async ({ input }) => {
            await PM2.action('stop')(input);

            return { ok: true };
        }),
    restart: t.procedure
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