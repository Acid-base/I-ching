import React from 'react'
import { Box, Text, VStack, useColorModeValue } from '@chakra-ui/react'

interface TrigramProps {
  lines: number[]
  name: string
  attribute: string
}

// Simple line component for trigram
const TrigramLine = ({ filled }: { filled: boolean }) => (
  <Box
    w="100%"
    h="3px"
    bg={filled ? 'blue.500' : 'transparent'}
    borderTop="1px solid"
    borderBottom="1px solid"
    borderColor="currentColor"
    mb={1}
  />
)

export function Trigram({ lines, name, attribute }: TrigramProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  return (
    <Box
      p={3}
      borderRadius="md"
      borderWidth="1px"
      bg={bgColor}
      borderColor={borderColor}
      w="100px"
    >
      <VStack spacing={2} align="center">
        <Box w="60px">
          {lines.map((line, index) => (
            <TrigramLine key={index} filled={line === 1} />
          ))}
        </Box>
        <Text fontSize="sm" fontWeight="medium">
          {name}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {attribute}
        </Text>
      </VStack>
    </Box>
  )
} 