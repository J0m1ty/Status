import { useCallback, useEffect, useRef, useState } from "react";
import type { ProcessStatus } from "../../../backend/src/types";

interface SSEOptions {
    url: string;
    eventName: string;
    idleTimeout?: number;
}

export const useSSE = <T = ProcessStatus[]>({ url, eventName, idleTimeout = 5_000 }: SSEOptions) => {
    const [data, setData] = useState<T | null>(null);
    const [status, setStatus] = useState<
        "connecting" | "open" | "error" | "reconnecting"
    >("connecting");

    const retryAttempt = useRef(0);
    const idleTimer = useRef<ReturnType<typeof setTimeout>>();
    const esRef = useRef<EventSource>();

    const bumpIdle = () => {
        clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => {
            setStatus("reconnecting");
            reconnect();
        }, idleTimeout);
    };

    const reconnect = useCallback(() => {
        retryAttempt.current += 1;
        const delay = Math.min(1000 * 2 ** retryAttempt.current, 30_000);

        clearTimeout(idleTimer.current);
        esRef.current?.close();

        setTimeout(() => {
            open();
        }, delay);
    }, [idleTimeout, eventName, url]);

    const open = useCallback(() => {
        setStatus(retryAttempt.current ? "reconnecting" : "connecting");

        const es = new EventSource(url);
        esRef.current = es;

        es.addEventListener("open", () => {
            retryAttempt.current = 0;
            setStatus("open");
            bumpIdle();
        });

        es.addEventListener(eventName, (ev) => {
            try {
                setData(JSON.parse(ev.data) as T);
                bumpIdle();
            } catch (err) {
                console.error("Failed to parse SSE payload", err);
                setStatus("error");
            }
        });

        es.addEventListener("error", () => {
            setStatus("error");
            reconnect();
        });
    }, [eventName, url, reconnect]);

    useEffect(() => {
        open();

        return () => {
            clearTimeout(idleTimer.current);
            esRef.current?.close();
        };
    }, [open]);

    return { data, status } as const;
}