import { Component, ReactNode } from 'react'
import { Box, Heading, Text, Button } from '@chakra-ui/react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} textAlign="center">
          <Heading mb={4}>Something went wrong</Heading>
          <Text mb={4}>{this.state.error?.message}</Text>
          <Button onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
} 