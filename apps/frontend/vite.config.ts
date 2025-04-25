import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        port: 9000,
        proxy: {
            '/api/events': {
                target: 'http://localhost:3003',
                changeOrigin: true
            },
            '/api/auth': {
                target: 'http://localhost:3004',
                changeOrigin: true
            },
            '/api/status': {
                target: 'http://localhost:3004',
                changeOrigin: true
            }
        },
    },
    build: {
        cssMinify: 'lightningcss'
    }
});