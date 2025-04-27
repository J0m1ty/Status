import { create } from 'zustand';
import type { ProcessStatus } from '../../../backend/src/types';

interface ProcessState {
    processes: ProcessStatus[];
    loading: boolean;
    error: Error | null;
    set: (processes: ProcessStatus[]) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: Error | null) => void;
}

export const useProcesses = create<ProcessState>((set) => ({
    processes: [],
    loading: true,
    error: null,
    set: (processes: ProcessStatus[]) => set({ processes }),
    setLoading: (loading: boolean) => set({ loading }),
    setError: (error: Error | null) => set({ error }),
}));