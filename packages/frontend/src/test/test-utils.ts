import { React } from "npm:react@18.2.0"
import { ChakraProvider } from "npm:@chakra-ui/react@2.8.2"
import { QueryClient, QueryClientProvider } from "npm:@tanstack/react-query@5.17.19"
import { render } from "npm:@testing-library/react@14.2.1"
import { userEvent } from "npm:@testing-library/user-event@14.5.2"

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

export function renderWithProviders(
  ui: React.ReactElement,
  { queryClient = createTestQueryClient() } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>{children}</ChakraProvider>
      </QueryClientProvider>
    )
  }

  return {
    ...render(ui, { wrapper: Wrapper }),
    user: userEvent.setup(),
  }
} 