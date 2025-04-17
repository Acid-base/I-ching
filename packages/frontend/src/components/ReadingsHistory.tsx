import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    IconButton,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure,
    VStack
} from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { FaEye, FaTrash } from 'react-icons/fa';
import { ReadingResponse } from '../types/reading';
import { formatDate } from '../utils/dateUtils';

// Key for storing readings in localStorage
const STORAGE_KEY = 'iching_saved_readings';

interface SavedReading {
  timestamp: number;
  reading: ReadingResponse;
}

interface ReadingsHistoryProps {
  onViewReading: (reading: ReadingResponse) => void;
  onClose: () => void;
}

export function ReadingsHistory({ onViewReading, onClose }: ReadingsHistoryProps) {
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [readingToDelete, setReadingToDelete] = useState<number | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose: onAlertClose } = useDisclosure();

  // Load saved readings from localStorage
  useEffect(() => {
    const loadSavedReadings = () => {
      try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          // Sort readings by timestamp (newest first)
          const sortedReadings = parsedData.sort((a: SavedReading, b: SavedReading) =>
            b.timestamp - a.timestamp
          );
          setSavedReadings(sortedReadings);
        }
      } catch (error) {
        console.error('Failed to load saved readings:', error);
      }
    };

    loadSavedReadings();
  }, []);

  // Handle viewing a reading
  const handleViewReading = (reading: ReadingResponse) => {
    onViewReading(reading);
    onClose();
  };

  // Confirm deletion dialog
  const confirmDelete = (index: number) => {
    setReadingToDelete(index);
    onOpen();
  };

  // Handle deleting a reading
  const handleDeleteReading = () => {
    if (readingToDelete !== null) {
      const updatedReadings = [...savedReadings];
      updatedReadings.splice(readingToDelete, 1);
      setSavedReadings(updatedReadings);

      // Update localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReadings));
      setReadingToDelete(null);
      onAlertClose();
    }
  };

  // Format the hexagram information for display
  const getReadingDisplayInfo = (reading: ReadingResponse) => {
    if (!reading) return { title: 'Unknown', subtitle: '' };

    let title = 'Hexagram';
    let subtitle = '';

    if (reading.hexagram && reading.hexagram.number) {
      title = `Hexagram ${reading.hexagram.number}`;
      if (reading.hexagram.name) {
        title += `: ${reading.hexagram.name}`;
      }
    } else if (reading.primary_hexagram) {
      title = `Hexagram ${reading.primary_hexagram.number}`;
      if (reading.primary_hexagram.name) {
        title += `: ${reading.primary_hexagram.name}`;
      }
      if (reading.related_hexagram) {
        subtitle = `Changing to Hexagram ${reading.related_hexagram.number}: ${reading.related_hexagram.name || ''}`;
      }
    }

    return { title, subtitle };
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={5}
      bg={bgColor}
      borderColor={borderColor}
      maxHeight="70vh"
      overflowY="auto"
      width="100%"
    >
      <Heading size="md" mb={4}>Saved Readings</Heading>
      {savedReadings.length === 0 ? (
        <Text color="gray.500" py={4} textAlign="center">
          No saved readings found. Readings will be automatically saved when generated.
        </Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {savedReadings.map((item, index) => {
            const { title, subtitle } = getReadingDisplayInfo(item.reading);
            return (
              <Box
                key={index}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                borderColor={borderColor}
              >
                <Flex justifyContent="space-between" alignItems="center">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">{title}</Text>
                    {subtitle && <Text fontSize="sm" color="gray.500">{subtitle}</Text>}
                    <Text fontSize="xs" color="gray.500">
                      {formatDate(new Date(item.timestamp))}
                    </Text>
                  </VStack>
                  <Flex>
                    <Tooltip label="View reading">
                      <IconButton
                        aria-label="View reading"
                        icon={<FaEye />}
                        size="sm"
                        mr={2}
                        onClick={() => handleViewReading(item.reading)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        aria-label="Delete reading"
                        icon={<FaTrash />}
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => confirmDelete(index)}
                      />
                    </Tooltip>
                  </Flex>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      )}
      <Divider my={4} />
      <Button width="100%" onClick={onClose}>Close</Button>

      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={undefined}
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Reading
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this reading? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={onAlertClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteReading} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
