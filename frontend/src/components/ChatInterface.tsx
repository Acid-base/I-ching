import {
  Alert,
  AlertIcon,
  Avatar,
  Box,
  Button,
  HStack,
  Input,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react"; // Added useState
import { type ChatMessage } from "../hooks/useAiInterpreter"; // Import ChatMessage type

// Add props for chat state and actions
interface ChatInterfaceProps {
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
}

export function ChatInterface({
  chatHistory,
  isLoading,
  error,
  sendMessage,
}: ChatInterfaceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const [inputValue, setInputValue] = useState(""); // Control input value

  // Scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const messageToSend = inputValue;
    setInputValue(""); // Clear input immediately
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <VStack spacing={4} w="full" maxW="container.md" mx="auto">
      <Box
        w="full"
        h="400px"
        overflowY="auto"
        p={4}
        borderRadius="xl"
        borderWidth="1px"
        bg={bgColor}
        borderColor={borderColor}
        role="log"
        aria-live="polite"
      >
        {/* Chat messages */}
        <VStack spacing={4} align="stretch">
          {chatHistory.map((msg, idx) => (
            <HStack
              key={idx}
              align="start"
              justify={msg.role === "user" ? "flex-end" : "flex-start"}
            >
              <Avatar
                size="sm"
                name={msg.role === "user" ? "You" : "AI"}
                bg={msg.role === "user" ? "blue.500" : "purple.500"}
              />
              <Box
                maxW="70%"
                p={3}
                borderRadius="lg"
                bg={msg.role === "user" ? "blue.500" : "purple.500"}
                color="white"
              >
                <Text>{msg.content}</Text>
              </Box>
            </HStack>
          ))}
          <div ref={chatEndRef} />
        </VStack>
      </Box>

      {error && (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      )}

      <HStack w="full">
        {" "}
        {/* Ensure HStack takes full width */}
        <Input
          ref={inputRef} // Keep ref if needed for focus management
          value={inputValue} // Controlled input
          onChange={(e) => setInputValue(e.target.value)} // Update state on change
          placeholder="Ask about your reading..."
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          size="lg"
          borderRadius="full"
          aria-label="Chat message input"
          flexGrow={1} // Allow input to grow
        />
        <Button
          onClick={handleSendMessage}
          isLoading={isLoading}
          loadingText="Sending..."
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          px={8}
        >
          Send
        </Button>
      </HStack>
    </VStack>
  );
}
