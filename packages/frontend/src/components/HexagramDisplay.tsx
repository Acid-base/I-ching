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
  const textColor = useColorModeValue('gray.700', 'gray.200')
  const accentColor = useColorModeValue('purple.600', 'purple.300')
  const sectionBgColor = useColorModeValue('gray.50', 'gray.700')

  if (isLoading) {
    return <Box>Loading...</Box>
  }

  if (!reading) {
    return <Box>No reading available</Box>
  }

  // Format the hexagram data for display
  const getJudgmentText = () => {
    if (!reading.reading.judgment) return '';
    return typeof reading.reading.judgment === 'string'
      ? reading.reading.judgment
      : reading.reading.judgment.text || '';
  }

  const getImageText = () => {
    if (!reading.reading.image) return '';
    return typeof reading.reading.image === 'string'
      ? reading.reading.image
      : reading.reading.image.text || '';
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
            Hexagram {reading.hexagram_number}: {reading.reading.name}
          </Heading>
          <Text fontSize="2xl" fontWeight="bold">
            {reading.reading.chineseName}
          </Text>
          <HStack spacing={4}>
            <Badge colorScheme="purple">Upper Trigram: {reading.reading.upperTrigram}</Badge>
            <Badge colorScheme="blue">Lower Trigram: {reading.reading.lowerTrigram}</Badge>
          </HStack>
        </VStack>

        <Divider />

        {/* Hexagram Lines and Meaning */}
        <Grid templateColumns={["1fr", null, "250px 1fr"]} gap={6}>
          {/* Left: Visual representation */}
          <GridItem>
            <VStack spacing={2} align="center" p={4} bg={sectionBgColor} borderRadius="md">
              {reading.lines.map((line, index) => (
                <HexagramLine
                  key={index}
                  value={line}
                  isChanging={reading.changing_lines.includes(index + 1)}
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

              {reading.reading.trigramSignificance && (
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={accentColor}>Trigram Significance</Text>
                  <Text mb={2}>Upper: {reading.reading.trigramSignificance.upper}</Text>
                  <Text mb={2}>Lower: {reading.reading.trigramSignificance.lower}</Text>
                  <Text>{reading.reading.trigramSignificance.relationship}</Text>
                </Box>
              )}
            </VStack>
          </GridItem>
        </Grid>

        {/* Commentary Section */}
        {reading.reading.commentary && reading.reading.commentary.length > 0 && (
          <>
            <Divider />
            <Box>
              <Heading size="md" mb={4} color={accentColor}>Commentary</Heading>
              <VStack align="stretch" spacing={2} p={4} bg={sectionBgColor} borderRadius="md">
                {reading.reading.commentary.map((paragraph, index) => (
                  <Text key={index}>{paragraph}</Text>
                ))}
              </VStack>
            </Box>
          </>
        )}

        {/* Changing Lines Section */}
        {reading.changing_lines && reading.changing_lines.length > 0 && (
          <>
            <Divider />
            <Box>
              <Heading size="md" mb={4} color={accentColor}>Changing Lines</Heading>
              <VStack align="stretch" spacing={4}>
                {reading.changing_lines.map((lineNum) => {
                  const lineInfo = reading.reading.lines?.find(l =>
                    typeof l === 'object' && l.lineNumber === lineNum
                  );

                  return lineInfo ? (
                    <Box key={lineNum} p={4} bg={sectionBgColor} borderRadius="md">
                      <Text fontWeight="bold" mb={2}>Line {lineNum}</Text>
                      <Text whiteSpace="pre-line">{lineInfo.meaning}</Text>
                    </Box>
                  ) : (
                    <Box key={lineNum} p={4} bg={sectionBgColor} borderRadius="md">
                      <Text fontWeight="bold">Line {lineNum} (changing)</Text>
                    </Box>
                  );
                })}
              </VStack>
            </Box>
          </>
        )}

        {/* Relating Hexagram Section */}
        {reading.relating_hexagram && (
          <>
            <Divider />
            <VStack spacing={6} align="stretch">
              <Heading size="md" color={accentColor}>
                Relating Hexagram {reading.relating_hexagram.number}: {reading.relating_hexagram.name}
              </Heading>
              <Text fontSize="xl" fontWeight="bold" textAlign="center">
                {reading.relating_hexagram.chineseName}
              </Text>

              <Grid templateColumns={["1fr", null, "1fr 1fr"]} gap={6}>
                <GridItem>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color={accentColor}>Judgment</Text>
                    <Text whiteSpace="pre-line">
                      {typeof reading.relating_hexagram.judgment === 'string'
                        ? reading.relating_hexagram.judgment
                        : reading.relating_hexagram.judgment?.text || ''}
                    </Text>
                  </Box>
                </GridItem>

                <GridItem>
                  <Box>
                    <Text fontWeight="bold" fontSize="lg" color={accentColor}>Image</Text>
                    <Text whiteSpace="pre-line">
                      {typeof reading.relating_hexagram.image === 'string'
                        ? reading.relating_hexagram.image
                        : reading.relating_hexagram.image?.text || ''}
                    </Text>
                  </Box>
                </GridItem>
              </Grid>

              {reading.relating_hexagram.trigramSignificance && (
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={accentColor}>Trigram Significance</Text>
                  <Text mb={2}>Upper: {reading.relating_hexagram.trigramSignificance.upper}</Text>
                  <Text mb={2}>Lower: {reading.relating_hexagram.trigramSignificance.lower}</Text>
                  <Text>{reading.relating_hexagram.trigramSignificance.relationship}</Text>
                </Box>
              )}

              {/* Relating Hexagram Commentary */}
              {reading.relating_hexagram.commentary && reading.relating_hexagram.commentary.length > 0 && (
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color={accentColor}>Commentary</Text>
                  <VStack align="stretch" spacing={2} p={4} bg={sectionBgColor} borderRadius="md">
                    {reading.relating_hexagram.commentary.map((paragraph, index) => (
                      <Text key={index}>{paragraph}</Text>
                    ))}
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
