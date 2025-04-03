import { Box, Container, VStack, Heading, Text, Button, HStack, Select, useColorModeValue } from '@chakra-ui/react';
import { YinYangSpinner } from './YinYangSpinner';
import { HexagramDisplay } from './HexagramDisplay';
import { ChatInterface } from './ChatInterface';
import { useReading } from '@hooks/useReading';
import { HexagramMode } from '@/types';

export function Layout() {
  const { reading, isLoading, error, generate, setMode } = useReading();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Container maxW="container.md" py={20}>
      <VStack
        spacing={8}
        p={8}
        bg={bgColor}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <YinYangSpinner />
        <Heading size="xl">Welcome to I Ching</Heading>
        <Text fontSize="lg" color="gray.600">
          The I Ching, or Book of Changes, is an ancient Chinese divination text and one of the oldest of the Chinese classics.
          Through a process of casting coins or yarrow stalks, it provides guidance and wisdom for your questions and situations.
        </Text>

        <HStack spacing={4}>
          <Select
            onChange={(e) => setMode(e.target.value as HexagramMode)}
            defaultValue={HexagramMode.YARROW}
            w="auto"
          >
            <option value={HexagramMode.YARROW}>Yarrow Stalks</option>
            <option value={HexagramMode.COINS}>Three Coins</option>
          </Select>
          <Button
            onClick={generate}
            isLoading={isLoading}
            colorScheme="purple"
            size="lg"
          >
            Cast Hexagram
          </Button>
        </HStack>

        <Text fontSize="md" color="gray.500">
          Click the button above to begin your consultation. Take a moment to center yourself and focus on your question.
        </Text>

        {error && (
          <Text color="red.500">
            Error: {error instanceof Error ? error.message : 'Failed to generate reading'}
          </Text>
        )}

        {reading && <HexagramDisplay reading={reading} isLoading={isLoading} />}
        {reading && <ChatInterface />}
      </VStack>
    </Container>
  );
}