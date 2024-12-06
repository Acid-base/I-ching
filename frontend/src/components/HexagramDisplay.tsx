import { Box, Grid } from '@chakra-ui/react'

interface HexagramDisplayProps {
  lines: number[]
  changingLines: number[]
}

export function HexagramDisplay({ lines, changingLines }: HexagramDisplayProps) {
  return (
    <Grid gap={2} maxW="200px" mx="auto">
      {lines.map((line, index) => (
        <Box
          key={index}
          h="20px"
          bg={changingLines.includes(index + 1) ? 'red.500' : undefined}
          position="relative"
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bg: line === 1 ? 'white' : 'black',
            border: line === 1 ? '1px solid black' : 'none',
          }}
        />
      ))}
    </Grid>
  )
} 