import { useEffect } from "react";
import { useProcesses } from "./useProcesses"
import { eventService } from "../services/EventService";


export const useEventSource = () => {
    const { set, setLoading } = useProcesses();

    useEffect(() => {
        eventService.setCallbacks(
            (data) => set(data),
            (loading) => setLoading(loading)
        );

        eventService.connect();

        return () => {
            eventService.disconnect();
        };
    }, [set, setLoading]);
}