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
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { ReadingResponse } from "../services/hexagramService";
import { formatDate } from "../utils/dateUtils";

// Key for storing readings in localStorage - Use a consistent key
// Define this in a constants file ideally, e.g., src/constants.ts
const SAVED_READINGS_KEY = "iching_saved_readings"; // Use the same key as useReading/useHexagram

// Interface for saved reading structure in localStorage
interface SavedReading {
  timestamp: number;
  reading: ReadingResponse; // Ensure this matches the stored structure
}

interface ReadingsHistoryProps {
  onViewReading: (reading: ReadingResponse) => void;
  onClose: () => void;
}

export function ReadingsHistory({
  onViewReading,
  onClose,
}: ReadingsHistoryProps) {
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [readingToDelete, setReadingToDelete] = useState<number | null>(null);
  const { isOpen, onOpen, onClose: onAlertClose } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Load saved readings from localStorage on mount
  useEffect(() => {
    const loadSavedReadings = () => {
      try {
        const savedReadingsJson = localStorage.getItem(SAVED_READINGS_KEY);
        if (savedReadingsJson) {
          const parsedReadings = JSON.parse(
            savedReadingsJson,
          ) as SavedReading[];
          // TODO: Add validation for each reading structure if necessary
          setSavedReadings(parsedReadings);
        }
      } catch (error) {
        console.error("Failed to load saved readings:", error);
        localStorage.removeItem(SAVED_READINGS_KEY); // Clear potentially corrupted data
      }
    };

    loadSavedReadings();
  }, []);

  // Handle viewing a reading
  const handleViewReading = (reading: ReadingResponse) => {
    onViewReading(reading);
    onClose(); // Close the history modal
  };

  // Confirm deletion dialog
  const confirmDelete = (index: number) => {
    setReadingToDelete(index);
    onOpen(); // Open the alert dialog
  };

  // Handle deleting a reading
  const handleDeleteReading = () => {
    if (readingToDelete !== null) {
      const updatedReadings = savedReadings.filter(
        (_, index) => index !== readingToDelete,
      );
      setSavedReadings(updatedReadings);

      // Update localStorage
      localStorage.setItem(SAVED_READINGS_KEY, JSON.stringify(updatedReadings));
      setReadingToDelete(null); // Reset delete index
      onAlertClose(); // Close the alert dialog
    }
  };

  // Format the hexagram information for display
  const getReadingDisplayInfo = (reading: ReadingResponse) => {
    let title = "Unknown Reading";
    let subtitle = "";

    // Access data from the nested structure
    const primary = reading.reading; // Corresponds to primary_hexagram
    const transformed = reading.relating_hexagram; // Corresponds to transformed_hexagram

    if (primary) {
      title = `Hexagram ${primary.number}`;
      if (primary.name) {
        title += `: ${primary.name}`;
      }
      if (transformed) {
        subtitle = `Changing to Hexagram ${transformed.number}`;
        if (transformed.name) {
          subtitle += `: ${transformed.name}`;
        }
      }
    } else if (reading.hexagram_number) {
      // Fallback for potentially older/flattened structures if needed
      title = `Hexagram ${reading.hexagram_number}`;
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
      maxHeight="80vh" // Limit height
      display="flex"
      flexDirection="column"
    >
      <Heading size="md" mb={4} flexShrink={0}>
        Saved Readings
      </Heading>
      <Box flexGrow={1} overflowY="auto" pr={2}>
        {" "}
        {/* Scrollable area */}
        {savedReadings.length === 0 ? (
          <Text color="gray.500" py={4} textAlign="center">
            No saved readings found. Readings will be automatically saved when
            generated.
          </Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {savedReadings.map((item, index) => {
              // Validate item.reading structure before accessing
              if (!item.reading) return null;
              const { title, subtitle } = getReadingDisplayInfo(item.reading);
              return (
                <Box
                  key={item.timestamp || index} // Use timestamp if available
                  borderWidth="1px"
                  borderRadius="md"
                  p={3}
                  borderColor={borderColor}
                >
                  <Flex justifyContent="space-between" alignItems="center">
                    <VStack align="start" spacing={1} flexGrow={1} mr={2}>
                      <Text fontWeight="bold" noOfLines={1}>
                        {title}
                      </Text>
                      {subtitle && (
                        <Text fontSize="sm" color="gray.500" noOfLines={1}>
                          {subtitle}
                        </Text>
                      )}
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(new Date(item.timestamp))}
                      </Text>
                    </VStack>
                    <Flex flexShrink={0}>
                      <Tooltip label="View reading">
                        <IconButton
                          aria-label="View reading"
                          icon={<FaEye />}
                          size="sm"
                          mr={2}
                          onClick={() => handleViewReading(item.reading)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete reading">
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
      </Box>
      <Divider my={4} flexShrink={0} />
      <Button width="100%" onClick={onClose} flexShrink={0}>
        Close
      </Button>

      {/* Delete confirmation dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={useRef(null)} // Assign a ref
        onClose={onAlertClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Reading
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this reading? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={useRef(null)} onClick={onAlertClose}>
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
