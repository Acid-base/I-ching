import type { ReadingResponse } from '@/types';
import { Badge, Box, Divider, Grid, GridItem, Heading, HStack, Text, useColorModeValue, VStack } from '@chakra-ui/react';
import { HexagramLine } from '@components/HexagramLine';

interface HexagramDisplayProps {
  reading: ReadingResponse | null
  isLoading?: boolean
}

export function HexagramDisplay({ reading, isLoading }: HexagramDisplayProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const accentColor = useColorModeValue('purple.600', 'purple.300')
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700')

  if (isLoading) {
    return <Box>Loading...</Box>
  }

  if (!reading) {
    return <Box>No reading available</Box>
  }

  // Check if the reading has the expected structure
  const hasDataProperty = reading && 'data' in reading && reading.data;
  const hexagramNumber = hasDataProperty ? reading.data.hexagram_number : (reading as any).hexagram_number;
  const hexagramData = hasDataProperty ? reading.data.reading : (reading as any).reading;
  const changingLines = hasDataProperty ? reading.data.changing_lines : (reading as any).changing_lines;
  const lines = hasDataProperty ? reading.data.lines : (reading as any).lines;
  const relatingHexagram = hasDataProperty ? reading.data.relating_hexagram : (reading as any).relating_hexagram;

  // Exit early if we don't have the minimum required data
  if (!hexagramData || !hexagramNumber) {
    return <Box>Invalid reading data structure</Box>
  }

  // Format the hexagram data for display
  const getJudgmentText = () => {
    if (!hexagramData.judgment) return '';
    return typeof hexagramData.judgment === 'string'
      ? hexagramData.judgment
      : hexagramData.judgment.text || '';
  }

  const getImageText = () => {
    if (!hexagramData.image) return '';
    return typeof hexagramData.image === 'string'
      ? hexagramData.image
      : hexagramData.image.text || '';
  }

  return (
    <Box
      p={6}
      borderRadius="xl"
      borderWidth="1px"
      bg={bgColor}
      borderColor={borderColor}
      shadow="md"
      w="full"
      maxW="container.xl"
    >
      <VStack spacing={8} align="stretch">
        {/* Primary Hexagram Header */}
        <VStack spacing={2} align="center">
          <Heading size="lg" color={accentColor}>
            Hexagram {hexagramNumber}: {hexagramData.name}
          </Heading>
          <Text fontSize="2xl" fontWeight="bold">
            {hexagramData.chinese}
          </Text>
          <HStack spacing={4}>
            <Badge colorScheme="purple">Upper Trigram: {hexagramData.trigrams?.upper?.name || 'N/A'}</Badge>
            <Badge colorScheme="blue">Lower Trigram: {hexagramData.trigrams?.lower?.name || 'N/A'}</Badge>
          </HStack>
        </VStack>
        <Divider />

        {/* Hexagram Lines and Meaning */}
        <Grid templateColumns={["1fr", null, "250px 1fr"]} gap={6}>
          {/* Left: Visual representation */}
          <GridItem>
            <VStack spacing={2} align="center" p={4} bg={sectionBgColor} borderRadius="md">
              {lines && lines.map((line: number, index: number) => (
                <HexagramLine
                  key={index}
                  value={line}
                  isChanging={changingLines?.includes(index + 1) || false}
                  position={6 - index}
                />
              )).reverse()} {/* Reversed to match traditional display (bottom to top) */}
            </VStack>
          </GridItem>

          {/* Right: Judgment and Image */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontWeight="bold" fontSize="lg" color={accentColor}>Judgment</Text>
                <Text whiteSpace="pre-line">{getJudgmentText()}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg" color={accentColor}>Image</Text>
                <Text whiteSpace="pre-line">{getImageText()}</Text>
              </Box>
              {hexagramData.trigrams && (
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={accentColor}>Trigram Significance</Text>
                  <Text mb={2}>Upper: {hexagramData.trigrams.upper?.attribute || 'N/A'}</Text>
                  <Text mb={2}>Lower: {hexagramData.trigrams.lower?.attribute || 'N/A'}</Text>
                </Box>
              )}
            </VStack>
          </GridItem>
        </Grid>

        {/* Commentary Section - Updated to use lines as commentary */}
        {hexagramData.lines && hexagramData.lines.length > 0 && (
          <>
            <Divider />
            <Box>
              <Heading size="md" mb={4} color={accentColor}>Line Meanings</Heading>
              <VStack align="stretch" spacing={2} p={4} bg={sectionBgColor} borderRadius="md">
                {hexagramData.lines.map((line: any, index: number) => {
                  // Handle both string values and object values
                  const lineText = typeof line === 'string'
                    ? line
                    : line.meaning || JSON.stringify(line);

                  return (
                    <Text key={index}>Line {index + 1}: {lineText}</Text>
                  );
                })}
              </VStack>
            </Box>
          </>
        )}

        {/* Changing Lines Section */}
        {changingLines && changingLines.length > 0 && (
          <>
            <Divider />
            <Box>
              <Heading size="md" mb={4} color={accentColor}>Changing Lines</Heading>
              <VStack align="stretch" spacing={4}>
                {changingLines.map((lineNum: number) => {
                  const line = hexagramData.lines?.[lineNum - 1];
                  // Handle both string values and object values
                  const lineText = typeof line === 'string'
                    ? line
                    : line?.meaning || JSON.stringify(line);

                  return (
                    <Box key={lineNum} p={4} bg={sectionBgColor} borderRadius="md">
                      <Text fontWeight="bold" mb={2}>Line {lineNum}</Text>
                      <Text whiteSpace="pre-line">{lineText || 'No description available'}</Text>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </>
        )}

        {/* Relating Hexagram Section */}
        {relatingHexagram && (
          <>
            <Divider />
            <VStack spacing={6} align="stretch">
              <Heading size="md" color={accentColor}>
                Relating Hexagram {relatingHexagram.number}: {relatingHexagram.name}
              </Heading>
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                {relatingHexagram.chinese}
              </Text>
              <Grid templateColumns={["1fr", null, "1fr 1fr"]} gap={6}>
                <GridItem>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color={accentColor}>Judgment</Text>
                    <Text whiteSpace="pre-line">
                      {typeof relatingHexagram.judgment === 'string'
                        ? relatingHexagram.judgment
                        : relatingHexagram.judgment?.text || ''}
                    </Text>
                  </Box>
                </GridItem>
                <GridItem>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color={accentColor}>Image</Text>
                    <Text whiteSpace="pre-line">
                      {typeof relatingHexagram.image === 'string'
                        ? relatingHexagram.image
                        : relatingHexagram.image?.text || ''}
                    </Text>
                  </Box>
                </GridItem>
              </Grid>
              {relatingHexagram.trigrams && (
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={accentColor}>Trigram Significance</Text>
                  <Text mb={2}>Upper: {relatingHexagram.trigrams.upper?.attribute || 'N/A'}</Text>
                  <Text mb={2}>Lower: {relatingHexagram.trigrams.lower?.attribute || 'N/A'}</Text>
                </Box>
              )}
              {/* Relating Hexagram Line Meanings */}
              {relatingHexagram.lines && relatingHexagram.lines.length > 0 && (
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={accentColor}>Line Meanings</Text>
                  <VStack align="stretch" spacing={2} p={4} bg={sectionBgColor} borderRadius="md">
                    {relatingHexagram.lines.map((line: any, index: number) => {
                      // Handle both string values and object values
                      const lineText = typeof line === 'string'
                        ? line
                        : line.meaning || JSON.stringify(line);

                      return (
                        <Text key={index}>Line {index + 1}: {lineText}</Text>
                      );
                    })}
                  </VStack>
                </Box>
              )}
            </VStack>
          </>
        )}
      </VStack>
    </Box>
  )
}
