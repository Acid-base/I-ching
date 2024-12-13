import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Skeleton,
  useColorModeValue,
  Alert,
  AlertIcon,
  Button,
  HStack,
  Tooltip,
  Icon,
} from '@chakra-ui/react';
import { FaRobot, FaComments } from 'react-icons/fa';

interface AiInterpretationProps {
  interpretation?: string | null;
  isLoading: boolean;
  error?: string | null;
  onGetEnhanced: () => void;
  isEnhancedLoading?: boolean;
  onStartChat?: () => void;
  isChatEnabled?: boolean;
}

export function AiInterpretation({ 
  interpretation, 
  isLoading,
  error,
  onGetEnhanced,
  isEnhancedLoading,
  onStartChat,
  isChatEnabled = false
}: AiInterpretationProps) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Box
        p={6}
        borderRadius="xl"
        borderWidth="1px"
        bg={bgColor}
        borderColor={borderColor}
      >
        <VStack align="stretch" spacing={4}>
          <Skeleton height="24px" width="200px" />
          <Skeleton height="100px" />
        </VStack>
      </Box>
    );
  }

  if (!interpretation) return null;

  const paragraphs = interpretation.split('\n').filter(p => p.trim());

  return (
    <Box
      p={6}
      borderRadius="xl"
      borderWidth="1px"
      bg={bgColor}
      borderColor={borderColor}
      shadow="md"
      role="region"
      aria-label="AI Interpretation"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Heading size="md" color="purple.500" as="h2">
            AI Interpretation
          </Heading>
          <HStack spacing={4}>
            <Tooltip label="Get enhanced interpretation with detailed analysis">
              <Button
                leftIcon={<Icon as={FaRobot} />}
                colorScheme="purple"
                variant="outline"
                size="sm"
                onClick={onGetEnhanced}
                isLoading={isEnhancedLoading}
                loadingText="Analyzing..."
              >
                Get Enhanced Analysis
              </Button>
            </Tooltip>
            {isChatEnabled && onStartChat && (
              <Tooltip label="Start a conversation about this reading">
                <Button
                  leftIcon={<Icon as={FaComments} />}
                  colorScheme="blue"
                  size="sm"
                  onClick={onStartChat}
                >
                  Discuss Reading
                </Button>
              </Tooltip>
            )}
          </HStack>
        </HStack>

        {paragraphs.map((paragraph, index) => (
          <Text key={index} data-testid={`interpretation-paragraph-${index}`}>
            {paragraph}
          </Text>
        ))}
      </VStack>
    </Box>
  );
} 