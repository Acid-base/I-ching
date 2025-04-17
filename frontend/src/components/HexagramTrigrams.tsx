import React from 'react'
import { VStack, HStack, Text, Box, useColorModeValue } from '@chakra-ui/react'
import { Trigram } from './Trigram'
import { getTrigramData, splitHexagramToTrigrams } from '../utils/trigrams'

interface HexagramTrigramsProps {
  lines: number[]
}

export function HexagramTrigrams({ lines }: HexagramTrigramsProps) {
  const [upperLines, lowerLines] = splitHexagramToTrigrams(lines)
  const upperTrigram = getTrigramData(upperLines)
  const lowerTrigram = getTrigramData(lowerLines)

  const textColor = useColorModeValue('gray.600', 'gray.300')

  if (!upperTrigram || !lowerTrigram) {
    return null
  }

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={6} justify="center" align="flex-start">
        <VStack>
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            Upper Trigram
          </Text>
          <Trigram
            lines={upperLines}
            name={upperTrigram.name}
            attribute={upperTrigram.attribute}
          />
        </VStack>
        <VStack>
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            Lower Trigram
          </Text>
          <Trigram
            lines={lowerLines}
            name={lowerTrigram.name}
            attribute={lowerTrigram.attribute}
          />
        </VStack>
      </HStack>
      <Box textAlign="center">
        <Text fontSize="sm" color={textColor}>
          {upperTrigram.element} over {lowerTrigram.element}
        </Text>
      </Box>
    </VStack>
  )
} 