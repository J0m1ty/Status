import { env } from './env.js';
import { PM2 } from './api.js';
import { dirname, extname, join } from 'path';
import { fileURLToPath } from 'url';
import { createStreamableApp } from './see.js';
import { existsSync, readFileSync, statSync } from 'fs';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './routers.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '../../frontend/dist');

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
    payload: PM2.list,
}).get('/*', async (res, req) => {
    const url = req.getUrl();
    let file = join(root, url);

    if (!existsSync(file) || statSync(file).isDirectory()) {
        file = join(root, 'index.html');
    }

    const data = readFileSync(file);
    res.cork(() => {
        res.writeHeader('Content-Type', mime(extname(file)));
        res.write(data);
        res.end();
    });
}).listen(env.MAIN_PORT, (token) => {
    if (token) {
        console.log(`${process.cwd()}`);
        console.log(`Server is running on http://localhost:${env.MAIN_PORT}`);
    } else {
        console.log(`Failed to start server`);
    }
});

createHTTPServer({ router: appRouter }).listen(env.TRPC_PORT);

process.on('exit', PM2.disconnect);