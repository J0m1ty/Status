import { create } from 'zustand';

type Theme = 'light' | 'dark';

type ThemeState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
};

const savedTheme = localStorage.getItem('theme') as Theme ?? 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

export const useTheme = create<ThemeState>((set) => ({
    theme: savedTheme,
    setTheme: (theme) => {
        set({ theme });
        localStorage.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
    },
    toggleTheme: () => {
        set((s) => {
            const theme = s.theme === 'light' ? 'dark' : 'light';
            localStorage.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
            return { theme };
        });
    },
}));