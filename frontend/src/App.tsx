import { Box, Button, Container, Heading, useToast, VStack } from '@chakra-ui/react'
import { HexagramDisplay } from './components/HexagramDisplay'
import { ReadingDisplay } from './components/ReadingDisplay'
import { useReading } from './hooks/useReading'

function App() {
  const toast = useToast()
  const { generateReading, reading, isLoading, error } = useReading()

  const handleGenerateReading = async () => {
    try {
      await generateReading()
    } catch (err) {
      toast({
        title: 'Error',
        description: error || 'Failed to generate reading',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8}>
        <Heading>I Ching Reading</Heading>
        
        {reading && (
          <Box w="full">
            <HexagramDisplay
              lines={reading.lines}
              changingLines={reading.changing_lines}
            />
          </Box>
        )}

        <Button
          size="lg"
          onClick={handleGenerateReading}
          isLoading={isLoading}
        >
          Generate Reading
        </Button>

        {reading && (
          <ReadingDisplay reading={reading} />
        )}
      </VStack>
    </Container>
  )
}

export default App
