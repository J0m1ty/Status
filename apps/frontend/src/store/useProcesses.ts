import { create } from 'zustand';
import { ProcessStatus } from '../../../backend/src/api';

interface ProcessState {
    isLoading: boolean;
    processes: ProcessStatus[];
    error: string | null;
    set: (processes: ProcessStatus[]) => void;
    setLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useProcesses = create<ProcessState>((set) => ({
    isLoading: false,
    processes: [],
    error: null,
    set: (processes) => set({ processes, error: null }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error })
}));