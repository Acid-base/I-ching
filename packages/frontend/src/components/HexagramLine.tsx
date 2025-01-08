import React from 'react'
import { Box, HStack, useColorModeValue } from '@chakra-ui/react'

interface HexagramLineProps {
  value: number
  isChanging: boolean
  position: number
}

export function HexagramLine({ value, isChanging, position }: HexagramLineProps) {
  const lineColor = useColorModeValue('gray.800', 'white')
  const changingColor = useColorModeValue('purple.500', 'purple.300')
  const currentColor = isChanging ? changingColor : lineColor

  return (
    <Box
      w="100%"
      data-testid={`line-${position}`}
      position="relative"
      mb={2}
    >
      <HStack spacing={2} justify="center">
        {value === 1 ? (
          <Box
            h="4px"
            w="100%"
            bg={currentColor}
            data-testid={`line-${position}-solid`}
          />
        ) : (
          <>
            <Box
              h="4px"
              w="45%"
              bg={currentColor}
              data-testid={`line-${position}-broken`}
            />
            <Box w="10%" />
            <Box
              h="4px"
              w="45%"
              bg={currentColor}
            />
          </>
        )}
      </HStack>
    </Box>
  )
}
