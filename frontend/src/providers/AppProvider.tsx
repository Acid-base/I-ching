import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          {children}
        </ChakraProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
