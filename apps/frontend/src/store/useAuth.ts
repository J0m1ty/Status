import { create } from 'zustand';

type AuthState = {
    token: string | null;
    setToken: (t: string | null) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    token: localStorage.getItem('jwt'),
    setToken: (token) => {
        token ? localStorage.setItem('jwt', token) : localStorage.removeItem('jwt');
        set({ token });
    },
    logout: () => {
        localStorage.removeItem('jwt');
        set({ token: null });
    }
}));