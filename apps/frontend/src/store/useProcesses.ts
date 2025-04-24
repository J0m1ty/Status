import { create } from 'zustand';
import { ProcessStatus } from '../../../backend/src/api';

interface State {
    processes: ProcessStatus[];
    isLoading: boolean;
    error: string | null;
    set: (processes: ProcessStatus[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useProcesses = create<State>((set) => ({
    processes: [],
    isLoading: true,
    error: null,
    set: (processes) => {
        set({ processes, isLoading: false, error: null });
    },
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error })
}));

let eventSource: EventSource | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let retryCount = 0;

const connect = () => {
    if (eventSource) {
        eventSource.close();
    }

    useProcesses.getState().setLoading(true);
    eventSource = new EventSource('/api/events');
    
    eventSource.addEventListener('status', (e) => {
        try {
            const data = JSON.parse((e as MessageEvent).data) as ProcessStatus[];
            useProcesses.getState().set(data);
            retryCount = 0;
        } catch (err) {
            console.error('Error parsing SSE data:', err);
        }
    });

    eventSource.addEventListener('error', () => {
        eventSource?.close();
        const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000);
        retryCount++;
        
        if (reconnectTimeout) {
            clearTimeout(reconnectTimeout);
        }
        
        reconnectTimeout = setTimeout(connect, backoffTime);
        useProcesses.getState().setError('Connection lost. Reconnecting...');
    });
};

export const initSSE = () => {
    connect();
}