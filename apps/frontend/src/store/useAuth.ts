import { create } from 'zustand';

type AuthState = {
    authed: boolean;
    token: string | null;
    setToken: (t: string | null) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
    authed: false,
    token: localStorage.getItem('jwt'),
    setToken: (token) => {
        token ? localStorage.setItem('jwt', token) : localStorage.removeItem('jwt');
        set({ token, authed: token != null });
    },
    logout: () => {
        localStorage.removeItem('jwt');
        set({ token: null, authed: false });
    }
}));