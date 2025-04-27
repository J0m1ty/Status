import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../backend/src/routers';
import { useAuth } from '../store/useAuth';

export const queryClient = new QueryClient();

const trpcClient = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: '/api/',
            headers() {
                const token = useAuth.getState().token;
                return token ? { Authorization: `Bearer ${token}` } : {};
            }
        })
    ]
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
    client: trpcClient,
    queryClient
});

export const useTRPC = () => trpc;