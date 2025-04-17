import { HexagramMode } from '@/types';
import { Box, Button, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';

interface CastingFormProps {
  onCast: (mode: HexagramMode) => void;
  isLoading: boolean;
}

export function CastingForm({ onCast, isLoading }: CastingFormProps) {
  const handleSubmit = (mode: HexagramMode) => {
    onCast(mode);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" boxShadow="md" bg="white">
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">Choose Your Divination Method</Heading>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Button
            onClick={() => handleSubmit('yarrow')}
            disabled={isLoading}
            size="lg"
            height="100px"
            variant="outline"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            whiteSpace="normal"
            textAlign="center"
            p={4}
          >
            <Text fontWeight="medium" fontSize="lg">Yarrow Stalk Method</Text>
            <Text fontSize="sm" color="gray.600">Traditional method using 50 yarrow stalks</Text>
          </Button>

          <Button
            onClick={() => handleSubmit('coins')}
            disabled={isLoading}
            size="lg"
            height="100px"
            variant="outline"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            whiteSpace="normal"
            textAlign="center"
            p={4}
          >
            <Text fontWeight="medium" fontSize="lg">Three Coins Method</Text>
            <Text fontSize="sm" color="gray.600">Simplified method using three coins</Text>
          </Button>
        </SimpleGrid>

        {isLoading && (
          <Text textAlign="center" color="gray.600">
            Casting hexagram...
          </Text>
        )}
      </VStack>
    </Box>
  );
}
