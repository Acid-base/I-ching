import {
  Box,
  Heading,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import React from "react";
import { ReadingResponse } from "../types"; // Assuming ReadingResponse is the correct type import
import { HexagramLine } from "./HexagramLine"; // Assuming HexagramLine is used for rendering lines

interface HexagramDisplayProps {
  reading: ReadingResponse | null;
  isLoading: boolean;
}

export const HexagramDisplay: React.FC<HexagramDisplayProps> = ({
  reading,
  isLoading,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const accentColor = useColorModeValue("purple.600", "purple.300");
  const sectionBgColor = useColorModeValue("gray.50", "gray.700");

  if (isLoading) {
    return (
      <Box textAlign="center" py={10}>
        <Text mt={4}>Consulting the oracle...</Text>
      </Box>
    );
  }

  if (!reading) {
    return <Box>No reading available. Cast one to begin.</Box>;
  }

  const primaryHexagram = reading.hexagram || reading.primary_hexagram;
  const relatedHexagram = reading.related_hexagram;
  const changingLines = reading.changing_lines || [];
  const lines = reading.lines || primaryHexagram?.lines || [];

  if (!primaryHexagram) {
    return <Box>Invalid reading data: Missing primary hexagram.</Box>;
  }

  return (
    <VStack spacing={6} align="stretch" width="100%">
      <Box borderWidth={1} borderRadius="lg" p={6} bg={bgColor} boxShadow="md">
        <Heading as="h2" size="xl" mb={4} color={accentColor}>
          Hexagram {primaryHexagram.number}: {primaryHexagram.name}
        </Heading>
        <Text fontSize="lg" fontStyle="italic" mb={4}>
          {primaryHexagram.chineseName}
        </Text>

        <VStack spacing={1} mb={6}>
          {lines.map((lineValue, index) => (
            <HexagramLine
              key={index}
              position={index + 1}
              value={lineValue}
              isChanging={changingLines.includes(index + 1)}
            />
          ))}
        </VStack>

        <Box bg={sectionBgColor} p={4} borderRadius="md" mb={4}>
          <Heading as="h3" size="md" mb={2}>
            Judgment
          </Heading>
          <Text whiteSpace="pre-line">{primaryHexagram.judgment}</Text>
        </Box>

        <Box bg={sectionBgColor} p={4} borderRadius="md" mb={4}>
          <Heading as="h3" size="md" mb={2}>
            Image
          </Heading>
          <Text whiteSpace="pre-line">{primaryHexagram.image}</Text>
        </Box>

        {changingLines.length > 0 && (
          <Box bg={sectionBgColor} p={4} borderRadius="md" mb={4}>
            <Heading as="h3" size="md" mb={2}>
              Changing Lines
            </Heading>
            {primaryHexagram.lines &&
              primaryHexagram.lines.length === 6 &&
              changingLines.map((lineNumber) => {
                const lineInfo = primaryHexagram.lines.find(
                  (l) => l.position === lineNumber,
                );
                return lineInfo ? (
                  <Text key={lineNumber} mt={2}>
                    <strong>Line {lineNumber}:</strong> {lineInfo.meaning}
                  </Text>
                ) : null;
              })}
            {relatedHexagram && (
              <Text mt={4}>
                Transforms into Hexagram {relatedHexagram.number}:{" "}
                {relatedHexagram.name}
              </Text>
            )}
          </Box>
        )}

        {relatedHexagram && (
          <Box bg={sectionBgColor} p={4} borderRadius="md">
            <Heading as="h3" size="md" mb={2}>
              Relating Hexagram: {relatedHexagram.number} -{" "}
              {relatedHexagram.name}
            </Heading>
            <Text whiteSpace="pre-line">{relatedHexagram.judgment}</Text>
          </Box>
        )}
      </Box>
    </VStack>
  );
};
