import { useEffect, useRef } from 'react'
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Avatar,
  Flex,
  Divider,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useAiInterpreter } from '../hooks/useAiInterpreter'
import { InfoIcon } from '@chakra-ui/icons'

export function ChatInterface() {
  const {
    chatHistory,
    isLoading,
    error,
    startChat,
    sendMessage,
  } = useAiInterpreter()
  const inputRef = useRef<HTMLInputElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // Scroll to bottom when chat updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  const handleSendMessage = async () => {
    if (!inputRef.current?.value.trim() || isLoading) return
    await sendMessage(inputRef.current.value)
    inputRef.current.value = ''
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

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
              justify={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            >
              <Avatar
                size="sm"
                name={msg.role === 'user' ? 'You' : 'AI'}
                bg={msg.role === 'user' ? 'blue.500' : 'purple.500'}
              />
              <Box
                maxW="70%"
                p={3}
                borderRadius="lg"
                bg={msg.role === 'user' ? 'blue.500' : 'purple.500'}
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

      <HStack>
        <Input
          ref={inputRef}
          placeholder="Ask about your reading..."
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          size="lg"
          borderRadius="full"
          aria-label="Chat message input"
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
  )
} 