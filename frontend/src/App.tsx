import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  HStack,
  Heading,
  Icon,
  List,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  useToken,
} from "@chakra-ui/react";
import { AiInterpretation } from "@components/AiInterpretation";
import { ChatInterface } from "@components/ChatInterface";
import { keyframes } from "@emotion/react";
import { useAiInterpreter } from "@hooks/useAiInterpreter";
// Import useReading hook for state management
import { useReading } from "@hooks/useReading";
import React, { useState } from "react";
import {
  FaBook,
  FaChartLine,
  FaCoins,
  FaComments,
  FaExchangeAlt,
  FaLightbulb,
  FaYinYang,
} from "react-icons/fa";
import { ReadingResponse } from "./api"; // Import ReadingResponse type
import { HexagramDisplay } from "./components/HexagramDisplay";
import { HexagramMode } from "./types"; // Import HexagramMode type

// Removed local fallback generation functions (now in hexagramService.ts)

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const YinYangSpinner = () => {
  const purple = useToken("colors", "purple.500");
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      animation={`${spin} 20s linear infinite`}
    >
      <Icon as={FaYinYang} w={20} h={20} color={purple} />
    </Box>
  );
};

interface ProcessStepProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ProcessStep = ({ icon, title, description }: ProcessStepProps) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  return (
    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <VStack spacing={3} align="center">
          <Icon as={icon} w={8} h={8} color="purple.500" />
          <Text fontWeight="bold" fontSize="lg">
            {title}
          </Text>
          <Text color="gray.600" textAlign="center">
            {description}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const ComponentItem = ({
  icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <ListItem>
    <ListIcon as={icon} color="purple.500" />
    <Text as="span" fontWeight="bold">
      {title}
    </Text>
    <Text>{description}</Text>
  </ListItem>
);

const ReadingOverview = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <VStack spacing={6} w="full">
      <Heading size="md" color="purple.500">
        Understanding Your Reading
      </Heading>

      <Accordion allowMultiple w="full">
        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Components of a Reading
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <List spacing={3}>
              <ComponentItem
                icon={FaYinYang}
                title="Primary Hexagram:"
                description="The main symbol formed by your cast, consisting of six lines representing yin and yang energies."
              />
              <ComponentItem
                icon={FaExchangeAlt}
                title="Changing Lines:"
                description="Lines that are in transition, indicating areas of change or focus in your situation."
              />
              <ComponentItem
                icon={FaBook}
                title="Judgment & Image:"
                description="Traditional interpretations providing guidance and symbolic imagery."
              />
              <ComponentItem
                icon={FaLightbulb}
                title="AI Interpretation:"
                description="Modern analysis connecting ancient wisdom to your contemporary situation."
              />
            </List>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                The Divination Process
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <SimpleGrid columns={[1, null, 3]} spacing={6} py={4}>
              <ProcessStep
                icon={FaYinYang}
                title="Hexagram Generation"
                description="Using virtual yarrow stalks or coins to create your unique hexagram pattern"
              />
              <ProcessStep
                icon={FaChartLine}
                title="Pattern Analysis"
                description="Identifying the primary hexagram, changing lines, and relating hexagram"
              />
              <ProcessStep
                icon={FaLightbulb}
                title="AI Enhancement"
                description="Combining traditional wisdom with modern insights for practical guidance"
              />
            </SimpleGrid>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem>
          <h3>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Interactive Features
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h3>
          <AccordionPanel>
            <VStack align="stretch" spacing={4}>
              <HStack>
                <Icon as={FaLightbulb} color="purple.500" />
                <Text fontWeight="bold">Enhanced Analysis:</Text>
                <Text>
                  Get deeper insights with AI-powered interpretation of
                  traditional symbolism.
                </Text>
              </HStack>
              <HStack>
                <Icon as={FaComments} color="purple.500" />
                <Text fontWeight="bold">Chat Consultation:</Text>
                <Text>
                  Engage in a dialogue about your reading for personalized
                  guidance.
                </Text>
              </HStack>
              <Divider />
              <Text fontSize="sm" color="gray.600">
                Each feature is designed to help you gain deeper understanding
                of the I Ching's wisdom and its application to your situation.
              </Text>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
};

const LandingSection = ({
  onGenerate,
  isLoading,
}: {
  onGenerate: (method: HexagramMode) => void; // Expect method argument
  isLoading: boolean;
}) => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  // Removed useMethodSelection hook usage here, handled by App/useReading
  const toast = useToast();

  const handleSelectMethod = (method: HexagramMode) => {
    // Directly call the onGenerate prop passed from App with the selected method
    onGenerate(method);
    setShowMethodSelector(false); // Hide selector after selection
    toast({
      title: `Casting initiated using ${method === "yarrow" ? "Yarrow stalk" : "Three coins"} method`,
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

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
        <YinYangSpinner />
        <Heading size="xl">Welcome to I Ching</Heading>
        <Text fontSize="lg" color="gray.600">
          The I Ching, or Book of Changes, is an ancient Chinese divination text
          and one of the oldest of the Chinese classics. Through a process of
          casting coins or yarrow stalks, it provides guidance and wisdom for
          your questions and situations.
        </Text>

        {!showMethodSelector ? (
          <>
            <Text fontSize="md" color="gray.500">
              Click the button below to begin your consultation. Take a moment
              to center yourself and focus on your question.
            </Text>
            <Button
              onClick={() => setShowMethodSelector(true)}
              colorScheme="purple"
              size="lg"
              px={8}
              fontSize="md"
              leftIcon={<Icon as={FaYinYang} />}
              isDisabled={isLoading} // Disable if already loading
            >
              Begin Consultation
            </Button>
          </>
        ) : (
          <VStack spacing={4} width="100%">
            <Text fontSize="md" color="gray.500">
              Choose your preferred divination method
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
              <Button
                onClick={() => handleSelectMethod("yarrow")}
                isLoading={isLoading} // Use the isLoading prop from App
                variant="outline"
                colorScheme="purple"
                size="lg"
                height="100px"
                display="flex"
                flexDirection="column"
                p={4}
              >
                <Icon as={FaYinYang} boxSize={6} mb={2} />
                <Text fontWeight="bold">Yarrow Stalk Method</Text>
                <Text fontSize="sm">Traditional method (50 stalks)</Text>
              </Button>

              <Button
                onClick={() => handleSelectMethod("coins")}
                isLoading={isLoading} // Use the isLoading prop from App
                variant="outline"
                colorScheme="purple"
                size="lg"
                height="100px"
                display="flex"
                flexDirection="column"
                p={4}
              >
                <Icon as={FaCoins} boxSize={6} mb={2} />
                <Text fontWeight="bold">Three Coins Method</Text>
                <Text fontSize="sm">Simplified divination</Text>
              </Button>
            </SimpleGrid>
          </VStack>
        )}

        <Divider />
        <ReadingOverview />
      </VStack>
    </Container>
  );
};

export function App() {
  // Use the useReading hook for managing reading state and generation
  const {
    reading,
    isLoading: isGenerating, // Renamed for clarity if needed, or use directly
    error: generateError,
    generate,
    setMode, // Function to set the casting mode
    clearReading, // Function to clear the reading
    loadReading, // Function to load a reading (e.g., from history)
  } = useReading();

  const {
    interpretation,
    isLoading: isInterpreting,
    isEnhancedLoading,
    error: interpretError,
    // Removed getInterpretation as it's less used now
    getEnhancedInterpretation,
    startChat,
    isChatEnabled,
    chatHistory, // Pass down if needed
    sendMessage, // Pass down if needed
    clearInterpretation, // Add function to clear interpretation state
  } = useAiInterpreter();

  const toast = useToast();

  // Updated handleGenerate to accept method and use useReading hook
  const handleGenerate = async (method: HexagramMode) => {
    try {
      console.log(`Starting reading generation with ${method}...`);
      setMode(method); // Set the mode in the useReading hook
      await generate(); // Generate the reading using the hook
      console.log("Reading generated");
      // Interpretation is now triggered manually via AiInterpretation component
      clearInterpretation(); // Clear previous interpretation on new reading
    } catch (error) {
      // ...existing error handling...
    }
  };

  const handleGetEnhanced = async () => {
    if (!reading) return;
    try {
      // Robustly get hexagram_number
      const primaryHexagram = reading.hexagram || reading.primary_hexagram;
      if (!primaryHexagram?.number) {
         throw new Error("Invalid reading: hexagram number not found");
      }
      await getEnhancedInterpretation(primaryHexagram.number);
    } catch (error) {
      // ...existing error handling...
    }
  };

  const handleStartChat = async () => {
     if (!reading) {
       console.error("No reading available when trying to start chat");
       toast({ /* ... */ });
       return;
     }
    try {
       // Ensure reading object structure is suitable for startChat
       const primaryHexagram = reading.hexagram || reading.primary_hexagram;
       if (!primaryHexagram?.number) {
         throw new Error("Invalid reading: hexagram number not found for chat");
       }
       // Pass a consistent structure if needed by startChat, or just the reading
       await startChat(reading);
    } catch (error) {
      // ...existing error handling...
    }
  };

  // Function to handle resetting the app state (clearing reading)
  const handleReset = () => {
    clearReading();
    clearInterpretation();
    // Optionally clear chat history if needed: clearChatHistory();
  };

  return (
    <Box minH="100vh" py={8}>
      {!reading ? (
        // Pass the updated handleGenerate and isGenerating state
        <LandingSection onGenerate={handleGenerate} isLoading={isGenerating} />
      ) : (
        <VStack spacing={8} px={4} maxW="container.lg" mx="auto">
           {/* Add a button to cast a new hexagram */}
           <Button onClick={handleReset} colorScheme="gray" variant="outline" alignSelf="flex-start">
             Cast New Hexagram
           </Button>
          <HexagramDisplay reading={reading} isLoading={isGenerating} />
          <AiInterpretation
            interpretation={interpretation}
            isLoading={isInterpreting}
            // Combine generation and interpretation errors potentially
            error={generateError || interpretError}
            onGetEnhanced={handleGetEnhanced}
            isEnhancedLoading={isEnhancedLoading}
            onStartChat={handleStartChat}
            isChatEnabled={isChatEnabled}
          />
          {isChatEnabled && (
             <ChatInterface
               // Pass necessary props if ChatInterface expects them
               // chatHistory={chatHistory}
               // sendMessage={sendMessage}
               // isLoading={isInterpreting} // Or a dedicated chat loading state
               // error={interpretError} // Or a dedicated chat error state
             />
           )}
      {!reading ? (
        // Pass the updated handleGenerate function
        <LandingSection
          onGenerate={handleGenerate}
          isLoading={isGenerating}
          onMethodSelect={setMode}
        />
      ) : (
        <VStack spacing={8} px={4} maxW="container.xl" mx="auto">
          {/* Pass the full reading object to HexagramDisplay */}
          <HexagramDisplay reading={reading} isLoading={isGenerating} />

          <AiInterpretation
            interpretation={interpretation}
            isLoading={isInterpreting} // Loading state for basic interpretation (if any)
            error={interpretError?.message || generateError?.message}
            onGetEnhanced={handleGetEnhanced}
            isEnhancedLoading={isEnhancedLoading} // Loading state for enhanced interpretation
            onStartChat={handleStartChat}
            isChatEnabled={isChatEnabled}
          />
          {/* Conditionally render ChatInterface based on isChatEnabled state from hook */}
          {isChatEnabled && (
            <ChatInterface
            // Pass necessary props if ChatInterface needs them directly
            // chatHistory={chatHistory}
            // isLoading={isInterpreting} // Or a specific chat loading state
            // error={interpretError?.message}
            // sendMessage={sendMessage}
            />
          )}

          {/* Add a button to cast a new reading */}
          <Button onClick={clearReading} colorScheme="gray" mt={6}>
            Cast New Hexagram
          </Button>
        </VStack>
      )}
    </Box>
  );
}
