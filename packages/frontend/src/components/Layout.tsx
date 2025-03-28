import { Box, Container } from '@chakra-ui/react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    
  return (
    <Box minH="100vh" bg="gray.50">
      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  )
} 