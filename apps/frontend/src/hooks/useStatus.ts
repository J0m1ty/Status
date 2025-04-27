import { useEffect, useState } from "react";
import { useProcesses } from "../store/useProcesses";
import { useSSE } from "./useSSE";

export const useStatus = () => {
    const [ lastSize, setLastSize ] = useState(5);
    const { set, setLoading, setError } = useProcesses();
    const { data, status } = useSSE({ url: '/events', eventName: 'status' });

    useEffect(() => {
        if (data) {
            set(data);
            setLastSize(data.length);
        }
        else set(Array(lastSize).fill({}));
        
        switch (status) {
            case "connecting":
            case "reconnecting":
                setLoading(true);
                break;
            case "open":
                setLoading(false);
                setError(null);
                break;
            case "error":
                setLoading(false);
                setError(new Error("Failed to connect to SSE"));
                break;
        }
    }, [data, status, set, setLoading, setError]);
}