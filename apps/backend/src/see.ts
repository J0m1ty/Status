import { App, type HttpResponse } from "uWebSockets.js";

export const createStreamableApp = () => {
    const app = App();

    const streamSSE = ({ path, event, delay, payload }: { path: string; event: string, delay: number, payload: (() => any) }) => {
        const clients = new Set<HttpResponse>();

        app.get(path, async (res) => {
            res.cork(() => {
                res.writeHeader('Content-Type', 'text/event-stream');
                res.writeHeader('Connection', 'keep-alive');
                res.writeHeader('Cache-Control', 'no-cache');
                res.writeStatus('200 OK');
            });

            clients.add(res);

            res.onAborted(() => {
                clients.delete(res);
            });
        });

        let id = 0;
        setInterval(async () => {
            const data = await payload();
            const frame = `id: ${id++}\nevent: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

            for (const client of clients) client.cork(() => client.write(frame));
        }, delay);

        return app;
    };

    return {
        ...app,
        streamSSE
    }
}
