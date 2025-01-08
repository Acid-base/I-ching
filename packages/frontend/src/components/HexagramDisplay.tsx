import React from 'react'
import { Box, VStack, Text, Heading, useColorModeValue, Divider } from '@chakra-ui/react'
import type { ReadingResponse } from '@/types'
import { HexagramLine } from '@components/HexagramLine'

interface HexagramDisplayProps {
  reading: ReadingResponse['data']
  isLoading?: boolean
}

export function HexagramDisplay({ reading, isLoading }: HexagramDisplayProps) {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  if (isLoading) {
    return <Box>Loading...</Box>
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
      maxW="container.md"
    >
      <VStack spacing={6} align="stretch">
        <VStack spacing={2} align="center">
          <Heading size="lg">
            Hexagram {reading.hexagram_number}: {reading.reading.name}
          </Heading>
          <Text fontSize="xl" color="gray.500">
            {reading.reading.chinese}
          </Text>
        </VStack>

        <Divider />

        <Box py={4}>
          <VStack spacing={2} align="center" w="200px" mx="auto">
            {reading.lines.map((line, index) => (
              <HexagramLine
                key={index}
                value={line}
                isChanging={reading.changing_lines.includes(index + 1)}
                position={index + 1}
              />
            ))}
          </VStack>
        </Box>

        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontWeight="bold">Judgment</Text>
            <Text>{reading.reading.judgment.text}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Image</Text>
            <Text>{reading.reading.image.text}</Text>
          </Box>
        </VStack>
      </VStack>
    </Box>
  )
}