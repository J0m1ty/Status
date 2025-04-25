import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { App } from './App';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/trpc';
import './index.css';

const container = document.querySelector('#root') as Element;
const root = createRoot(container);

root.render(
    <QueryClientProvider client={queryClient}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </QueryClientProvider>
);
