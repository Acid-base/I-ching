import { Box, Flex, Heading, Text, VStack, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useHexagram } from '../hooks/useHexagram';
import HexagramDisplay from '../components/HexagramDisplay';
import AiInterpretation from '../components/AiInterpretation';

const HexagramReadingPage = () => {
  const { id } = useParams<{ id: string }>();
  const hexagramNumber = id ? parseInt(id) : 0;
  const { data: hexagram, isLoading, error } = useHexagram(hexagramNumber);

  if (isLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
      </Flex>
    );
  }

  if (error || !hexagram) {
    return (
      <Alert status="error" variant="subtle" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center" height="200px">
        <AlertIcon boxSize="40px" mr={0} />
        <Text mt={4}>Error loading hexagram data.</Text>
      </Alert>
    );
  }

  return (
    <Box maxW="800px" mx="auto" p={5}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Hexagram {hexagram.number}: {hexagram.name}
          </Heading>
          <Text fontSize="lg" fontStyle="italic">
            {hexagram.chineseName} • {hexagram.pronunciation}
          </Text>
        </Box>

        <Flex justifyContent="center" mb={6}>
          <HexagramDisplay hexagram={hexagram} size="lg" />
        </Flex>

        <Box>
          <Heading as="h2" size="md" mb={3}>
            The Judgment
          </Heading>
          <Text whiteSpace="pre-line">{hexagram.judgment}</Text>
        </Box>

        <Box>
          <Heading as="h2" size="md" mb={3}>
            The Image
          </Heading>
          <Text whiteSpace="pre-line">{hexagram.image}</Text>
        </Box>

        <AiInterpretation hexagram={hexagram} />
      </VStack>
    </Box>
  );
};

export default HexagramReadingPage;