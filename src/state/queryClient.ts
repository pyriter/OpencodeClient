import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});

// Dev hatch: expose for browser-console inspection and tests.
if (__DEV__ && typeof globalThis !== 'undefined') {
  (globalThis as unknown as { __qc?: QueryClient }).__qc = queryClient;
}
