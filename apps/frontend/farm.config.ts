import { defineConfig } from '@farmfe/core';
import tailwind from '@farmfe/js-plugin-tailwindcss';

export default defineConfig({
    plugins: ['@farmfe/plugin-react', tailwind()],
    server: {
        port: 9001,
        proxy: {
            '/api/trpc': {
                target: 'http://localhost:3003',
            },
            '/api/events': {
                target: 'http://localhost:3003',
            },
            '/api/login': {
                target: 'http://localhost:3003',
            }
        }
    }
});
