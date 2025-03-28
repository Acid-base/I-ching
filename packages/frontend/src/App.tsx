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
} from '@chakra-ui/react';
import { AiInterpretation } from '@components/AiInterpretation';
import { ChatInterface } from '@components/ChatInterface';
import { HexagramDisplay } from '@components/HexagramDisplay';
import { keyframes } from '@emotion/react';
import { useAiInterpreter } from '@hooks/useAiInterpreter';
import { useHexagram } from '@hooks/useHexagram';
import React from 'react';
import { FaBook, FaChartLine, FaComments, FaExchangeAlt, FaLightbulb, FaYinYang } from 'react-icons/fa';

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const YinYangSpinner = () => {
  const purple = useToken('colors', 'purple.500');
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
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  return (
    <Card bg={bgColor} borderColor={borderColor} borderWidth="1px">
      <CardBody>
        <VStack spacing={3} align="center">
          <Icon as={icon} w={8} h={8} color="purple.500" />
          <Text fontWeight="bold" fontSize="lg">{title}</Text>
          <Text color="gray.600" textAlign="center">{description}</Text>
        </VStack>
      </CardBody>
    </Card>
  );
};

const ComponentItem = ({ icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
  <ListItem>
    <ListIcon as={icon} color="purple.500" />
    <Text as="span" fontWeight="bold">{title}</Text>
    <Text>{description}</Text>
  </ListItem>
);

const ReadingOverview = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <VStack spacing={6} w="full">
      <Heading size="md" color="purple.500">Understanding Your Reading</Heading>

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
                <Text>Get deeper insights with AI-powered interpretation of traditional symbolism.</Text>
              </HStack>
              <HStack>
                <Icon as={FaComments} color="purple.500" />
                <Text fontWeight="bold">Chat Consultation:</Text>
                <Text>Engage in a dialogue about your reading for personalized guidance.</Text>
              </HStack>
              <Divider />
              <Text fontSize="sm" color="gray.600">
                Each feature is designed to help you gain deeper understanding of the I Ching's wisdom
                and its application to your situation.
              </Text>
            </VStack>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </VStack>
  );
};

const LandingSection = ({ onGenerate, isLoading }: { onGenerate: () => void, isLoading: boolean }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

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
          The I Ching, or Book of Changes, is an ancient Chinese divination text and one of the oldest of the Chinese classics.
          Through a process of casting coins or yarrow stalks, it provides guidance and wisdom for your questions and situations.
        </Text>
        <Text fontSize="md" color="gray.500">
          Click the button below to begin your consultation. Take a moment to center yourself and focus on your question.
        </Text>
        <Button
          onClick={onGenerate}
          isLoading={isLoading}
          colorScheme="purple"
          size="lg"
          px={8}
          fontSize="md"
          leftIcon={<Icon as={FaYinYang} />}
        >
          Generate Reading
        </Button>
        <Divider />
        <ReadingOverview />
      </VStack>
    </Container>
  );
};

export function App() {
  const {
    reading,
    isGenerating,
    generateError,
    generate,
  } = useHexagram();

  const {
    interpretation,
    isLoading: isInterpreting,
    isEnhancedLoading,
    error: interpretError,
    getInterpretation,
    getEnhancedInterpretation,
    startChat,
    isChatEnabled,
  } = useAiInterpreter();

  const toast = useToast();

  const handleGenerate = async () => {
    try {
      console.log('Starting reading generation...');
      const result = await generate();
      console.log('Reading generated');
      // Removed automatic call to getInterpretation
    } catch (error) {
      console.error('Error in handleGenerate:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate reading',
        status: 'error',
      });
    }
  };

  const handleGetEnhanced = async () => {
    if (!reading) return;
    try {
      // Get hexagram_number from either the root or data property
      const hexagramNumber = ('data' in reading && reading.data?.hexagram_number)
        ? reading.data.hexagram_number
        : (reading as any).hexagram_number;

      if (!hexagramNumber) {
        throw new Error('Invalid reading: hexagram number not found');
      }

      await getEnhancedInterpretation(hexagramNumber);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to get enhanced interpretation',
        status: 'error',
      });
    }
  };

  const handleStartChat = async () => {
    try {
      // Pass the current reading to the startChat function
      if (reading) {
        // Handle both possible structures of the reading object
        const readingToUse = {
          ...reading,
          hexagram_number: ('data' in reading && reading.data?.hexagram_number)
            ? reading.data.hexagram_number
            : (reading as any).hexagram_number
        };

        if (!readingToUse.hexagram_number) {
          throw new Error('Invalid reading: hexagram number not found');
        }

        await startChat(readingToUse as any);
      } else {
        console.error('No reading available when trying to start chat');
        toast({
          title: 'Error',
          description: 'No reading available. Please generate a reading first.',
          status: 'error',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to start chat',
        status: 'error',
      });
    }
  };

  return (
    <Box minH="100vh" py={8}>
      {!reading ? (
        <LandingSection onGenerate={handleGenerate} isLoading={isGenerating} />
      ) : (
        <VStack spacing={8} px={4}>
          <HexagramDisplay
            reading={reading}
            isLoading={isGenerating}
          />
          <AiInterpretation
            interpretation={interpretation}
            isLoading={isInterpreting}
            error={interpretError || generateError?.message}
            onGetEnhanced={handleGetEnhanced}
            isEnhancedLoading={isEnhancedLoading}
            onStartChat={handleStartChat}
            isChatEnabled={isChatEnabled}
          />
          {isChatEnabled && <ChatInterface />}
        </VStack>
      )}
    </Box>
  );
}
