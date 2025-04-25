import { env } from './env.js';
import { PM2 } from './api.js';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { createStreamableApp } from './see.js';
import { existsSync, readFileSync, statSync } from 'fs';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter, createContext } from './routers.js';
import { readFile } from 'fs/promises';
import { App } from 'uWebSockets.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');

const mime = (ext: string) => {
    return ({
        'js': 'application/javascript',
        'css': 'text/css',
        'html': 'text/html',
        'json': 'application/json',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'svg': 'image/svg+xml',
    }[ext.slice(1)] ?? 'application/octet-stream');
}

createStreamableApp().streamSSE({
    path: '/api/events',
    event: 'status',
    delay: 1000,
    payload: PM2.list
}).get('/*', async (res, req) => {
    res.onAborted(() => {
        res.aborted = true;
    });

    const url = req.getUrl();
    let file = join(ROOT, url);

    if (!existsSync(file) || statSync(file).isDirectory()) {
        file = join(ROOT, 'index.html');
    }

    const data = await readFile(file);

    if (!res.aborted) {
        res.cork(() => {
            res.writeHeader('Content-Type', mime(extname(file)));
            res.write(data);
            res.end();
        });
    }
}).listen(env.MAIN_PORT, (token) => {
    if (token) {
        console.log(`Web server is running on :${env.MAIN_PORT}`);
    } else {
        console.log(`Failed to start server`);
    }
});

createHTTPServer({
    router: appRouter,
    createContext,
    basePath: '/api/',
}).listen(env.TRPC_PORT, () => {
    console.log(`TRPC server is running on :${env.TRPC_PORT}`);
});

process.on('exit', PM2.disconnect);