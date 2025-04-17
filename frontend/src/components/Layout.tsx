import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  IconButton,
  Modal,
  ModalContent,
  ModalOverlay,
  Select,
  Text,
  useColorModeValue,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { FaHistory } from 'react-icons/fa';
import { useReading } from '../hooks/useReading';
import { HexagramDisplay } from './HexagramDisplay';
import { ReadingsHistory } from './ReadingsHistory';
import { YinYangSpinner } from './YinYangSpinner';
// Define HexagramMode type locally
type HexagramMode = 'yarrow' | 'coins';

export function Layout() {
  const { reading, isLoading, error, generate, setMode, loadReading } = useReading();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Container maxW="container.md" py={20}>
      <VStack
        spacing={8}
        p={8}
        bg={bgColor}
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        textAlign="center"
      >
        <HStack w="100%" justifyContent="space-between" alignItems="center">
          <Box />
          <YinYangSpinner />
          <IconButton
            aria-label="View reading history"
            icon={<FaHistory />}
            size="md"
            onClick={onOpen}
          />
        </HStack>

        <Heading size="xl">Welcome to I Ching</Heading>
        <Text fontSize="lg" color="gray.600">
          The I Ching, or Book of Changes, is an ancient Chinese divination text and one of the oldest of the Chinese classics.
          Through a process of casting coins or yarrow stalks, it provides guidance and wisdom for your questions and situations.
        </Text>

        <HStack spacing={4}>
          <Select
            w="50%"
            onChange={(e) => setMode(e.target.value as HexagramMode)}
            defaultValue="yarrow"
          >
            <option value="yarrow">Yarrow Stalk Method</option>
            <option value="coins">Coin Method</option>
          </Select>
          <Button
            colorScheme="purple"
            onClick={generate}
            isLoading={isLoading}
            loadingText="Casting..."
            w="50%"
          >
            Cast Hexagram
          </Button>
        </HStack>

        {error && <Text color="red.500">{error}</Text>}

        {reading && <HexagramDisplay reading={reading} isLoading={isLoading} />}
      </VStack>

      {/* Readings History Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="95%" maxH="90vh">
          <ReadingsHistory onViewReading={loadReading} onClose={onClose} />
        </ModalContent>
      </Modal>
    </Container>
  );
}
