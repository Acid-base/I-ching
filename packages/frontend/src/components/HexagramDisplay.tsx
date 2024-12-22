import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  HStack,
  Tooltip,
  Grid,
} from '@chakra-ui/react';
import type { ReadingResponse } from '../types';

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

interface HexagramDisplayProps {
  reading?: ReadingResponse | null;
  isLoading?: boolean;
}

export const HexagramDisplay = ({ reading, isLoading }: HexagramDisplayProps) => {
  const lines = useMemo(() => {
    if (!reading) return [];
    return reading.reading.structure.map((line: string) => parseInt(line, 10));
  }, [reading]);

  if (isLoading) return <Box>Loading...</Box>
  if (!reading) return null

  const { reading: hexagram, changing_lines } = reading;
  
  return (
    <VStack spacing={4}>
      <Text fontSize="2xl">
        {hexagram.englishName} ({hexagram.chineseName})
      </Text>
      <HexagramLines lines={lines} changingLines={changing_lines} />
      
      <Grid templateColumns="1fr" gap={2}>
        {hexagram.structure.map((line: string, i: number) => (
          <Box 
            key={i}
            bg={changing_lines.includes(i + 1) ? "yellow.200" : "gray.200"}
            h="8px"
            w="full"
          />
        ))}
      </Grid>

      <Text>{hexagram.judgment}</Text>
      <Text>{hexagram.image}</Text>
    </VStack>
  )
}