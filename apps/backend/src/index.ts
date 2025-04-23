import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { env } from './env.js'
import { streamSSE } from 'hono/streaming'
import { auth } from './middleware/auth.js';
import { statusRouter } from './trpc/status.js';
import { trpcServer } from '@hono/trpc-server';
import { sign } from 'hono/jwt';
import { connect, disconnect, list } from './pm2/api.js';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, statSync } from 'fs';
import { readFile } from 'fs/promises';
import { serveStatic } from '@hono/node-server/serve-static';

const app = new Hono();

app.get('/api/events', async (c) => {
    return streamSSE(c, async (stream) => {
        let id = 0;
        await connect();

        try {
            while (true) {
                const processes = await list();
                await stream.writeSSE({
                    data: JSON.stringify(processes),
                    event: 'status',
                    id: `${id++}`,
                });

                await stream.sleep(1000);
            }
        } finally {
            await disconnect();
        }
    });
});

app.post('/api/login', async (c) => {
    const { username, password } = await c.req.json();

    if (username != env.ADMIN_USER || password != env.ADMIN_PASS) {
        return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await sign({ sub: username, exp: Math.floor(Date.now() / 1000) + 3600 }, env.JWT_SECRET, 'HS256');
    return c.json({ token });
});

app.use('/api/trpc', auth);
app.use('/api/trpc/*', trpcServer({ router: statusRouter, endpoint: '/api/trpc' }));

app.use('/*', serveStatic({ root: '../frontend/dist' }));

serve({
    fetch: app.fetch,
    port: env.PORT
}, (info) => {
    console.log(`Current directory: ${process.cwd()}`);
    console.log(`Server is running on http://localhost:${info.port}`);
});