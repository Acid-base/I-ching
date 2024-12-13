import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Heading,
  Container,
  HStack,
  Tooltip,
  Badge,
  Center,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

// Memoize simple components
const Line = React.memo(({ filled, changing }: { filled: boolean; changing?: boolean }) => (
  <HStack spacing={2} mb={1} opacity={changing ? 0.6 : 1}>
    <Box flex={1} h="2px" bg="currentColor" />
    {!filled && <Box w="10px" />}
    <Box flex={1} h="2px" bg="currentColor" />
  </HStack>
));

const HexagramLines = React.memo(({ lines, changingLines }: { lines: number[]; changingLines: number[] }) => (
  <Box w="100px" mb={4}>
    {lines.map((line, index) => (
      <Line 
        key={index} 
        filled={line % 2 === 1} 
        changing={changingLines.includes(index + 1)}
      />
    ))}
  </Box>
));

interface TrigramData {
  name: string;
  chinese: string;
  pinyin: string;
  attribute: string;
  element: string;
  image: string;
}

interface HexagramData {
  number: number;
  name: string;
  chinese: string;
  pinyin: string;
  description: string;
  alternate_names: string[];
  element: string;
  attribute: string;
  judgment: { text: string; explanation: string } | string;
  image: { text: string; explanation: string } | string;
  nuclear: { upper: number; lower: number };
  lines: Array<{
    number: number;
    value: number;
    meaning: string;
    transforms_to?: number | null;
  }>;
  trigrams: {
    upper: TrigramData;
    lower: TrigramData;
  };
}

interface ReadingResponse {
  hexagram_number: number;
  changing_lines: number[];
  lines: number[];
  reading: HexagramData;
  relating_hexagram: HexagramData | null;
}

interface HexagramDisplayProps {
  reading?: ReadingResponse | null;
  isLoading?: boolean;
}

const TrigramDisplay = React.memo(({ trigram, label }: { trigram: TrigramData; label: string }) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  
  return (
    <Box>
      <Text fontSize="sm" color="gray.500" mb={2}>{label}</Text>
      <Box
        p={3}
        borderRadius="md"
        bg={bgColor}
      >
        <HStack spacing={2}>
          <Text fontSize="md">{trigram.element}</Text>
          <Text color="gray.500">•</Text>
          <Tooltip label={trigram.image} aria-label={`${trigram.element} trigram image`}>
            <Text color={textColor} cursor="help">{trigram.attribute}</Text>
          </Tooltip>
        </HStack>
      </Box>
    </Box>
  );
});

const TextSection = React.memo(({ title, content, explanation }: { 
  title: string; 
  content: string; 
  explanation?: string;
}) => {
  const textColor = useColorModeValue('gray.600', 'gray.300');
  
  return (
    <Box>
      <Text fontWeight="medium" mb={2}>{title}</Text>
      <Text color={textColor} fontSize="md" mb={explanation ? 2 : 0}>
        {content}
      </Text>
      {explanation && (
        <Text fontSize="sm" color="gray.500">
          {explanation}
        </Text>
      )}
    </Box>
  );
});

export const HexagramDisplay: React.FC<HexagramDisplayProps> = React.memo(({ reading, isLoading }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('purple.500', 'purple.300');

  // Memoize validation function
  const validateHexagram = useMemo(() => (hexagram: HexagramData): boolean => {
    if (!hexagram || !hexagram.number || hexagram.number < 1 || hexagram.number > 64) {
      console.error('Invalid hexagram number:', hexagram?.number);
      return false;
    }
    if (!hexagram.lines || hexagram.lines.length !== 6) {
      console.error('Invalid line data for hexagram:', hexagram.number);
      return false;
    }
    return true;
  }, []);

  // Memoize hexagram rendering
  const renderHexagram = useMemo(() => (hexagram: HexagramData, isRelating: boolean = false) => {
    if (!hexagram || !validateHexagram(hexagram)) {
      return (
        <Box p={4} textAlign="center" color="red.500">
          <Text>Invalid hexagram data</Text>
        </Box>
      );
    }

    const hasParentheses = hexagram.description.includes('(');
    const [mainDesc, subDesc] = hasParentheses 
      ? hexagram.description.split('(')
      : [hexagram.description, null];

    return (
      <Container maxW="container.md" py={2}>
        <Box
          p={6}
          bg={bgColor}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          shadow="sm"
          role="article"
          aria-label={`${hexagram.name} hexagram details`}
        >
          <VStack spacing={4} align="stretch">
            {/* Title */}
            <VStack spacing={2} align="center">
              <HStack spacing={2} wrap="wrap" justify="center">
                <Heading size="lg">{hexagram.name}</Heading>
                <Badge colorScheme="purple">#{hexagram.number}</Badge>
              </HStack>
              <Text fontSize="2xl">{hexagram.chinese}</Text>
              {hexagram.pinyin && (
                <Text fontSize="sm" color="gray.500">
                  {hexagram.pinyin}
                </Text>
              )}
              <VStack spacing={0}>
                <Text fontSize="md" color={accentColor}>{mainDesc}</Text>
                {subDesc && (
                  <Text fontSize="sm" color="gray.500">
                    ({subDesc.replace(')', '')}
                  </Text>
                )}
              </VStack>
            </VStack>

            {/* Hexagram Lines */}
            {!isRelating && reading && (
              <Center>
                <HexagramLines 
                  lines={reading.lines} 
                  changingLines={reading.changing_lines}
                />
              </Center>
            )}

            {/* Element and Attribute */}
            <Box textAlign="center">
              <Badge variant="subtle" colorScheme="blue">
                {hexagram.element}
              </Badge>
              <Text fontSize="sm" color="gray.500" mt={1}>
                {hexagram.attribute}
              </Text>
            </Box>

            {/* Trigrams */}
            <Box>
              <Text fontWeight="medium" mb={3}>Trigrams</Text>
              <VStack spacing={3} align="stretch">
                <TrigramDisplay 
                  trigram={hexagram.trigrams.upper} 
                  label="Upper Trigram"
                />
                <TrigramDisplay 
                  trigram={hexagram.trigrams.lower} 
                  label="Lower Trigram"
                />
              </VStack>
            </Box>

            {/* Judgment */}
            <TextSection
              title="Judgment"
              content={typeof hexagram.judgment === 'string' 
                ? hexagram.judgment 
                : hexagram.judgment.text}
              explanation={typeof hexagram.judgment !== 'string' 
                ? hexagram.judgment.explanation 
                : undefined}
            />

            {/* Image */}
            <TextSection
              title="Image"
              content={typeof hexagram.image === 'string' 
                ? hexagram.image 
                : hexagram.image.text}
              explanation={typeof hexagram.image !== 'string' 
                ? hexagram.image.explanation 
                : undefined}
            />

            {/* Nuclear Hexagram Reference */}
            {hexagram.nuclear && (
              <Box>
                <Text fontSize="sm" color="gray.500">
                  Nuclear Hexagram: Upper #{hexagram.nuclear.upper}, Lower #{hexagram.nuclear.lower}
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Container>
    );
  }, [validateHexagram, bgColor, borderColor, accentColor]);

  if (isLoading) {
    return (
      <Center p={8}>
        <VStack spacing={4}>
          <MotionBox
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Box w={12} h={12} borderWidth={3} borderRadius="full" borderColor="purple.500" borderStyle="solid" />
          </MotionBox>
          <Text>Consulting the I Ching...</Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={4} width="full">
      {reading?.reading && validateHexagram(reading.reading) && renderHexagram(reading.reading)}
      {reading?.relating_hexagram && validateHexagram(reading.relating_hexagram) && (
        <>
          <Box textAlign="center" py={2}>
            <Text fontSize="sm" color="gray.500">
              Transforming through lines {reading.changing_lines.join(', ')}
            </Text>
          </Box>
          {renderHexagram(reading.relating_hexagram, true)}
        </>
      )}
    </VStack>
  );
}); 