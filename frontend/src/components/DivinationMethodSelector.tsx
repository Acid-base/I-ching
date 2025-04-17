import {
    Box,
    Button,
    Icon,
    SimpleGrid,
    Text,
    VStack,
    useColorModeValue,
} from '@chakra-ui/react';
import React from 'react';
import { FaYinYang } from 'react-icons/fa';
import { HiCog } from 'react-icons/hi';

type DivinationMethod = 'yarrow' | 'coins';

interface DivinationMethodSelectorProps {
  onSelectMethod: (method: DivinationMethod) => void;
  isLoading?: boolean;
}

export const DivinationMethodSelector: React.FC<DivinationMethodSelectorProps> = ({
  onSelectMethod,
  isLoading = false,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      boxShadow="md"
    >
      <VStack spacing={6} align="stretch">
        <Text fontSize="xl" fontWeight="bold" textAlign="center">
          Choose Your Divination Method
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Button
            onClick={() => onSelectMethod('yarrow')}
            isDisabled={isLoading}
            variant="outline"
            height="100px"
            display="flex"
            flexDirection="column"
            p={4}
          >
            <Icon as={FaYinYang} w={6} h={6} mb={2} />
            <Text fontWeight="bold">Yarrow Stalk Method</Text>
            <Text fontSize="sm" color="gray.600">
              Traditional method with 50 stalks
            </Text>
          </Button>

          <Button
            onClick={() => onSelectMethod('coins')}
            isDisabled={isLoading}
            variant="outline"
            height="100px"
            display="flex"
            flexDirection="column"
            p={4}
          >
            <Icon as={HiCog} w={6} h={6} mb={2} />
            <Text fontWeight="bold">Three Coins Method</Text>
            <Text fontSize="sm" color="gray.600">
              Simplified divination method
            </Text>
          </Button>
        </SimpleGrid>

        {isLoading && (
          <Text textAlign="center" color="gray.500">
            Consulting the oracle...
          </Text>
        )}
      </VStack>
    </Box>
  );
};
