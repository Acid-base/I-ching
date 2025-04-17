import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Divider,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Text,
  Tooltip,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import React from 'react';
import { FaComments, FaLightbulb, FaRobot } from 'react-icons/fa';

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
  const accentColor = useColorModeValue('purple.600', 'purple.300');
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700');

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  // Always render the container and buttons, even without interpretation
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
      w="full"
      maxW="container.xl"
    >
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <Heading size="md" color={accentColor} as="h2">
            <Icon as={FaLightbulb} mr={2} />
            AI Interpretation
          </Heading>
          <HStack spacing={4} flexWrap="wrap">
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
                Enhanced Analysis
              </Button>
            </Tooltip>
            {!isChatEnabled && onStartChat && (
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

        {isLoading ? (
          // Loading state
          <VStack align="stretch" spacing={4}>
            <Skeleton height="20px" width="90%" />
            <Skeleton height="20px" width="95%" />
            <Skeleton height="20px" width="85%" />
            <Skeleton height="20px" width="90%" />
            <Divider />
            <Skeleton height="20px" width="80%" />
            <Skeleton height="20px" width="90%" />
          </VStack>
        ) : interpretation ? (
          // Show interpretation content when available
          <>
            <Divider />
            <Box
              p={4}
              bg={sectionBgColor}
              borderRadius="md"
              className="ai-interpretation-content"
            >
              {interpretation.split(/\n\s*\n/).map((section, index) => (
                <React.Fragment key={index}>
                  {formatSection(section, accentColor)}
                </React.Fragment>
              ))}
            </Box>
          </>
        ) : (
          // Prompt when no interpretation is available
          <Box py={4} textAlign="center">
            <Text color="gray.500">
              Click "Enhanced Analysis" to get an AI-powered interpretation of your hexagram reading.
            </Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}

// Helper function to format sections of text
function formatSection(section: string, accentColor: string) {
  // Check if the section starts with a number or bullet
  const isNumberedPoint = /^\s*\d+[\.\)]/i.test(section) || /^\s*•/i.test(section);
  const isAllCapsHeader = /^[A-Z\s]+:/.test(section);

  if (isNumberedPoint || isAllCapsHeader) {
    // This is likely a header section
    const [header, ...content] = section.split('\n');
    return (
      <Box mt={4} mb={2}>
        <Text fontWeight="bold" fontSize="lg" color={accentColor}>{header}</Text>
        {content.map((paragraph, i) => (
          <Text key={i} mt={2}>{paragraph}</Text>
        ))}
      </Box>
    );
  } else {
    // Regular paragraph
    return (
      <Text mt={3} whiteSpace="pre-line">{section}</Text>
    );
  }
}
