import {
  Alert,
  AlertIcon,
  Box,
  Flex,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { AiInterpretation } from "../components/AiInterpretation"; // Corrected import path
import { HexagramDisplay } from "../components/HexagramDisplay"; // Corrected import path
import { useAiInterpreter } from "../hooks/useAiInterpreter"; // Import AI hook
import { useHexagram } from "../hooks/useHexagram"; // Assuming this fetches detailed hexagram data
import { ReadingResponse } from "../types"; // Import ReadingResponse type

const HexagramReadingPage = () => {
  const { id } = useParams<{ id: string }>();
  const hexagramNumber = id ? parseInt(id) : 0;
  const {
    data: hexagram,
    isLoading: isHexagramLoading,
    error: hexagramError,
  } = useHexagram(hexagramNumber);

  // Use AI Interpreter hook
  const {
    interpretation,
    isLoading: isInterpreting,
    isEnhancedLoading,
    error: interpretError,
    getEnhancedInterpretation, // Use getEnhancedInterpretation
    startChat,
    isChatEnabled,
    chatHistory, // Needed if ChatInterface is added
    sendMessage, // Needed if ChatInterface is added
  } = useAiInterpreter();

  if (isHexagramLoading) {
    return (
      <Flex justifyContent="center" alignItems="center" minH="50vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="purple.500" />
      </Flex>
    );
  }

  // Combine hexagram and interpretation errors
  const error = hexagramError || interpretError;

  if (error || !hexagram) {
    return (
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        height="200px"
      >
        <AlertIcon boxSize="40px" mr={0} />
        <Text mt={4}>Error loading hexagram data.</Text>
      </Alert>
    );
  }

  // Construct a minimal ReadingResponse object for HexagramDisplay
  // This assumes useHexagram provides the necessary details
  const readingForDisplay: ReadingResponse = {
    hexagram: hexagram, // Pass the fetched hexagram data
    primary_hexagram: hexagram, // Also assign to primary_hexagram for consistency
    lines: hexagram.lines?.map((l) => l.value) || [], // Extract line values if available
    changing_lines: [], // No changing lines context on this page
    related_hexagram: undefined, // No related hexagram context
    // Add other required fields from ReadingResponse with default/null values if necessary
    cast_method: "unknown",
    timestamp: Date.now(),
  };

  const handleGetEnhanced = () => {
    if (hexagramNumber) {
      getEnhancedInterpretation(hexagramNumber);
    }
  };

  // Add handleStartChat if chat feature is intended here
  // const handleStartChat = () => {
  //   if (readingForDisplay) {
  //     startChat(readingForDisplay); // Pass the constructed reading
  //   }
  // };

  return (
    <Box maxW="800px" mx="auto" p={5}>
      <VStack spacing={8} align="stretch">
        {/* Removed redundant title display, handled by HexagramDisplay */}
        {/* <Box textAlign="center"> ... </Box> */}

        <Flex justifyContent="center" mb={6}>
          {/* Pass the constructed reading object */}
          <HexagramDisplay
            reading={readingForDisplay}
            isLoading={isHexagramLoading}
          />
        </Flex>

        {/* Removed redundant Judgment and Image display, handled by HexagramDisplay */}
        {/* <Box> ... Judgment ... </Box> */}
        {/* <Box> ... Image ... </Box> */}

        {/* Pass necessary props to AiInterpretation */}
        <AiInterpretation
          interpretation={interpretation}
          isLoading={isInterpreting}
          error={interpretError}
          onGetEnhanced={handleGetEnhanced}
          isEnhancedLoading={isEnhancedLoading}
          // Pass chat props if chat is enabled for this view
          // onStartChat={handleStartChat}
          // isChatEnabled={isChatEnabled}
        />

        {/* Add ChatInterface if needed */}
        {/* {isChatEnabled && <ChatInterface />} */}
      </VStack>
    </Box>
  );
};

export default HexagramReadingPage;
