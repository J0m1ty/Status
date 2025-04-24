import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { QueryClient } from '@tanstack/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { StatusRouter } from '../../../backend/src/trpc/routers';
import { useAuth } from '../store/useAuth';

export const queryClient = new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } }
});

const trpcClient = createTRPCClient<StatusRouter>({
    links: [
        httpBatchLink({
            url: '/api/trpc',
            headers() {
                const token = useAuth.getState().token;
                return token ? { Authorization: `Bearer ${token}` } : {};
            }
        })
    ]
});

export const trpc = createTRPCOptionsProxy<StatusRouter>({
    client: trpcClient,
    queryClient
});

export const useTRPC = () => trpc;