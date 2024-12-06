import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { Reading } from '../types'

interface ReadingDisplayProps {
  reading: Reading
}

export function ReadingDisplay({ reading }: ReadingDisplayProps) {
  return (
    <VStack spacing={6} align="stretch" w="full">
      <Box>
        <Heading size="lg">
          {reading.reading.name} ({reading.reading.chinese} - {reading.hexagram_number})
        </Heading>
        <Text mt={2}>{reading.reading.description}</Text>
      </Box>

      <Box>
        <Heading size="md">Judgment</Heading>
        <Text mt={2}>{reading.reading.judgment}</Text>
      </Box>

      <Box>
        <Heading size="md">Image</Heading>
        <Text mt={2}>{reading.reading.image}</Text>
      </Box>

      {reading.changing_lines.length > 0 && (
        <>
          <Box>
            <Heading size="md">Changing Lines</Heading>
            {Object.entries(reading.reading.lines).map(([lineNumber, meaning]) => (
              <Box key={lineNumber} mt={2}>
                <Text fontWeight="bold">Line {lineNumber}:</Text>
                <Text>{meaning}</Text>
              </Box>
            ))}
          </Box>

          {reading.relating_hexagram && (
            <Box>
              <Heading size="md">Relating Hexagram</Heading>
              <Heading size="lg" mt={2}>
                {reading.relating_hexagram.name} ({reading.relating_hexagram.chinese} - {reading.relating_hexagram.number})
              </Heading>
              <Text mt={2}>{reading.relating_hexagram.description}</Text>
            </Box>
          )}
        </>
      )}
    </VStack>
  )
} 