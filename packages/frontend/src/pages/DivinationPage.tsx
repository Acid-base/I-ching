import { CastingForm } from '@/components/CastingForm';
import { useCastHexagram } from '@/hooks/useCastHexagram';
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  VStack,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md'; // Example icon
// Assuming useAiInterpreter hook exists and works independently
// import { useAiInterpreter } from '@/hooks/useAiInterpreter';

export function DivinationPage() {
  const { reading, isLoading, error, cast } = useCastHexagram();
  // const { interpretation, getInterpretation } = useAiInterpreter();

  const handleCast = async (mode: 'yarrow' | 'coins') => {
    await cast(mode);
    // Uncomment if AI interpretation is needed after casting
    // if (reading) {
    //   await getInterpretation(reading);
    // }
  };

  const handleReset = () => {
    // A simple way to reset is to reload the page, or implement state clearing
    window.location.reload();
  };

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          I Ching Divination
        </Heading>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {!reading ? (
          <CastingForm onCast={handleCast} isLoading={isLoading} />
        ) : (
          <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white">
            <VStack spacing={4} align="stretch">
              <Heading size="lg">
                Hexagram {reading.hexagram_number}: {reading.reading.name}
              </Heading>

              <Box>
                <Heading size="md" mb={2}>Judgment</Heading>
                <Text>{reading.reading.judgment}</Text>
              </Box>

              <Box>
                <Heading size="md" mb={2}>Image</Heading>
                <Text>{reading.reading.image}</Text>
              </Box>

              {reading.changing_lines.length > 0 && (
                <Box>
                  <Heading size="md" mb={2}>Changing Lines</Heading>
                  <List spacing={2}>
                    {reading.changing_lines.map((lineIndex) => (
                      <ListItem key={lineIndex}>
                        <ListIcon as={MdCheckCircle} color="green.500" />
                        <Text as="span" fontWeight="bold">Line {lineIndex + 1}:</Text> {reading.reading.lines[lineIndex]?.meaning || 'N/A'}
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {reading.relating_hexagram && (
                <Box>
                  <Divider my={4} />
                  <Heading size="md" mb={2}>Relating Hexagram</Heading>
                  <Text fontWeight="bold">
                    {reading.relating_hexagram.number}: {reading.relating_hexagram.name}
                  </Text>
                  <Text mt={1}>{reading.relating_hexagram.judgment}</Text>
                </Box>
              )}

              {/* Placeholder for AI Interpretation if needed */}
              {/* {interpretation && (
                <Box>
                  <Divider my={4} />
                  <Heading size="md" mb={2}>AI Interpretation</Heading>
                  <Text>{interpretation}</Text>
                </Box>
              )} */}

              <Button colorScheme="blue" onClick={handleReset} mt={6}>
                Cast New Hexagram
              </Button>
            </VStack>
          </Box>
        )}
      </VStack>
    </Container>
  );
}
