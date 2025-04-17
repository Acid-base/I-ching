import { Box, HStack, useColorModeValue } from "@chakra-ui/react";

interface HexagramLineProps {
  value: number; // Changed to number
  isChanging: boolean;
  position: number; // Line number (1-6)
}

export function HexagramLine({
  value,
  isChanging,
  position,
}: HexagramLineProps) {
  const lineColor = useColorModeValue("gray.800", "white");
  const changingColor = useColorModeValue("purple.500", "purple.300");
  const currentColor = isChanging ? changingColor : lineColor;

  // Determine line type based on numeric value
  // Yang lines (solid): 7 (Young Yang), 9 (Old Yang)
  // Yin lines (broken): 8 (Young Yin), 6 (Old Yin)
  const isYangLine = value === 7 || value === 9;

  return (
    <Box w="100%" data-testid={`line-${position}`} position="relative" mb={2}>
      <HStack spacing={2} justify="center">
        {isYangLine ? (
          // Solid line for Yang (7 or 9)
          <Box
            h="4px"
            w="100%"
            bg={currentColor}
            data-testid={`line-${position}-solid`}
          />
        ) : (
          // Broken line for Yin (6 or 8)
          <>
            <Box
              h="4px"
              w="45%"
              bg={currentColor}
              data-testid={`line-${position}-broken-left`}
            />
            <Box w="10%" /> {/* Gap in the middle */}
            <Box
              h="4px"
              w="45%"
              bg={currentColor}
              data-testid={`line-${position}-broken-right`}
            />
          </>
        )}
      </HStack>
    </Box>
  );
}
