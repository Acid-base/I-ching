import { type ReadingResponse } from '@/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import console from 'console';
import { useEffect, useState } from 'react';

// Constants
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// ===> ADD THIS LINE FOR DEBUGGING <===
console.log("VITE_GEMINI_API_KEY at build time:", GEMINI_API_KEY);
// =====================================

const STORAGE_KEYS = {
  CHAT_HISTORY: 'iching_chat_history',
  INTERPRETATIONS: 'iching_interpretations',
  CURRENT_READING: 'iching_current_reading',
  CHAT_SESSION_ID: 'iching_chat_session_id',
} as const;

// Initialize Google Generative AI SDK
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;
const model = genAI?.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

// Define a constant system prompt
const SYSTEM_INSTRUCTION = `
You are an I Ching expert guiding users through their readings.
Your primary purpose is to help users understand the spiritual and practical meanings of their hexagrams.
When responding:
1. Always relate your answers specifically to the user's hexagram reading
2. Reference the specific hexagram number, name, and any changing lines
3. Provide both traditional and modern interpretations
4. Be concise but insightful
`;

// Types
interface ChatMessage {
  role: string;
  content: string;
}

interface StoredInterpretation {
  reading: ReadingResponse;
  interpretation: string;
  timestamp: number;
}

interface UseAiInterpreterResult {
  interpretation: string | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  isEnhancedLoading: boolean;
  error: string | null;
  getInterpretation: (reading: ReadingResponse) => Promise<void>;
  getEnhancedInterpretation: (hexagramNumber: number) => Promise<void>;
  startChat: (providedReading?: ReadingResponse) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  isChatEnabled: boolean;
}

export function useAiInterpreter(): UseAiInterpreterResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancedLoading, setIsEnhancedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
  const [currentReading, setCurrentReading] = useState<ReadingResponse | null>(() => {
    // Try to load the current reading from localStorage on initial mount
    try {
      const savedReading = localStorage.getItem(STORAGE_KEYS.CURRENT_READING);
      if (!savedReading) return null;

      const parsedReading = JSON.parse(savedReading);
      // Accept any valid object as a reading, don't validate structure
      return parsedReading;
    } catch (e) {
      console.error('Error loading reading from localStorage:', e);
      // Clear the invalid data
      localStorage.removeItem(STORAGE_KEYS.CURRENT_READING);
      return null;
    }
  });

  // Reset chat when component mounts
  useEffect(() => {
    console.log('useAiInterpreter mounted');
    setChatHistory([]);
  }, []);

  // Save chat history to localStorage when it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory));
    }
  }, [chatHistory]);

  // Save current reading to localStorage when it changes
  useEffect(() => {
    if (currentReading) {
      // Save regardless of structure - don't check for data.hexagram_number
      console.log('Saving current reading to localStorage');
      localStorage.setItem(STORAGE_KEYS.CURRENT_READING, JSON.stringify(currentReading));
    }
  }, [currentReading]);

  const getInterpretation = async (reading: ReadingResponse) => {
    console.log('Getting interpretation for reading:', reading);
    setIsLoading(true);
    setError(null);

    // Save the reading so it's available for chat
    setCurrentReading(reading);

    try {
      // Check if API key is available
      if (!GEMINI_API_KEY || !model) {
        const basicInterpretation = `Hexagram ${reading.data.hexagram_number}: ${reading.data.reading.name || 'Unknown'}`;
        setInterpretation(basicInterpretation);
        console.log('No GEMINI_API_KEY found. Using basic interpretation.');
        return;
      }

      // Build the prompt for Gemini with system instruction included
      const prompt = `${SYSTEM_INSTRUCTION}
      I'd like an interpretation of an I Ching reading.
      Primary Hexagram: ${reading.data.hexagram_number} - ${reading.data.reading.name} (${reading.data.reading.chinese})
      Judgment: ${typeof reading.data.reading.judgment === 'string' ? reading.data.reading.judgment : reading.data.reading.judgment?.text}
      Image: ${typeof reading.data.reading.image === 'string' ? reading.data.reading.image : reading.data.reading.image?.text}
      ${reading.data.changing_lines.length > 0 ? `Changing Lines: ${reading.data.changing_lines.join(', ')}` : 'No changing lines'}
      ${reading.data.relating_hexagram ? `Relating Hexagram: ${reading.data.relating_hexagram.number} - ${reading.data.relating_hexagram.name} (${reading.data.relating_hexagram.chinese})` : ''}
      Please provide a comprehensive interpretation of this reading, including:
      1. The general meaning of the hexagram in the context of a divination
      2. Interpretation of any changing lines and their significance
      3. If there's a relating hexagram, explain the transition and what it suggests
      4. Practical advice based on this reading
      `;

      console.log('Sending prompt to Gemini');
      // Generate content using Gemini
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiInterpretation = response.text();
      console.log('Received AI interpretation');
      setInterpretation(aiInterpretation);
    } catch (e) {
      console.error('Error in getInterpretation:', e);
      setError(e instanceof Error ? e.message : 'Failed to get interpretation');
    } finally {
      setIsLoading(false);
    }
  };

  const getEnhancedInterpretation = async (hexagramNumber: number) => {
    console.log('Getting enhanced interpretation for hexagram:', hexagramNumber);
    setIsEnhancedLoading(true);

    try {
      if (!GEMINI_API_KEY || !model) {
        setError('Gemini API key is required for enhanced interpretations');
        return;
      }

      const prompt = `
      I'd like a deep philosophical and practical interpretation of I Ching hexagram ${hexagramNumber}.
      Please include:
      1. The hexagram's core meaning and symbolism
      2. Historical context and traditional interpretations
      3. Psychological implications according to Jung and others
      4. How this hexagram applies to different life areas (relationships, career, spiritual growth)
      5. Practical advice and reflection questions
      Format the response with clear sections and meaningful insights.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedInterpretation = response.text();
      setInterpretation(enhancedInterpretation);
    } catch (e) {
      console.error('Error in getEnhancedInterpretation:', e);
      setError(e instanceof Error ? e.message : 'Failed to get enhanced interpretation');
    } finally {
      setIsEnhancedLoading(false);
    }
  };

  const startAiChat = async (providedReading?: any) => {
    console.log('Starting AI chat');
    // Use the provided reading if available, otherwise check localStorage
    let readingToUse = providedReading;
    if (!readingToUse) {
      console.log('No reading provided to startChat, checking state and localStorage...');
      // If no reading was provided, try to use the one in state
      readingToUse = currentReading;
      // If still no reading, check localStorage
      if (!readingToUse) {
        try {
          const savedReadingStr = localStorage.getItem(STORAGE_KEYS.CURRENT_READING);
          console.log('Reading from localStorage when starting chat:', savedReadingStr);
          if (savedReadingStr) {
            const parsedReading = JSON.parse(savedReadingStr);
            // Verify the parsed data has the expected structure
            if (parsedReading) {
              readingToUse = parsedReading;
            }
          }
        } catch (e) {
          console.error('Error parsing reading from localStorage:', e);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_READING);
        }
      }
    } else {
      console.log('Reading provided to startChat:', providedReading);
      // Update currentReading state with the provided reading
      setCurrentReading(providedReading as any);
    }

    // Check if the reading exists
    if (!readingToUse) {
      console.error('No valid reading found in provided params, state, or localStorage');
      setChatHistory([
        {
          role: 'assistant',
          content:
            "Hello! I can help you explore I Ching readings. However, it seems we don't have a complete reading to discuss yet.",
        },
      ]);
      setIsChatEnabled(true);
      return;
    }

    // Normalize the reading structure to ensure we can access hexagram_number regardless of structure
    const hasDataProperty = readingToUse && 'data' in readingToUse && readingToUse.data;
    const hexagramNumber = hasDataProperty ? readingToUse.data.hexagram_number : (readingToUse as any).hexagram_number;
    const hexagramName = hasDataProperty ? readingToUse.data.reading.name : (readingToUse as any).reading.name;

    if (!hexagramNumber || !hexagramName) {
      console.error('Reading is missing hexagram number or name');
      setChatHistory([
        {
          role: 'assistant',
          content:
            "Hello! I can help you explore I Ching readings. However, it seems we don't have a complete reading to discuss yet.",
        },
      ]);
      setIsChatEnabled(true);
      return;
    }

    try {
      console.log('Using reading for chat:', hexagramNumber);
      // Set up the chat with the available reading
      setChatHistory([
        {
          role: 'assistant',
          content: `Hello! I'm ready to discuss your I Ching reading of Hexagram ${hexagramNumber}: ${hexagramName}. What would you like to know about this reading?`,
        },
      ]);
      setIsChatEnabled(true);
    } catch (e) {
      console.error('Error starting chat:', e);
      setError(e instanceof Error ? e.message : 'Failed to start chat');
    }
  };

  const sendMessage = async (content: string) => {
    console.log('Sending message:', content);
    // First add the user message to chat history
    setChatHistory((prev) => [...prev, { role: 'user', content }]);

    try {
      if (!GEMINI_API_KEY || !model) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'I apologize, but the AI chat feature requires a valid API key to function.',
          },
        ]);
        return;
      }

      // Check for the reading with proper validation for both structures
      let readingToUse: ReadingResponse | null = null;

      // First try to use the reading from state
      if (currentReading) {
        readingToUse = currentReading;
      } else {
        // If not available in state, try localStorage
        try {
          const savedReadingStr = localStorage.getItem(STORAGE_KEYS.CURRENT_READING);
          if (savedReadingStr) {
            const parsedReading = JSON.parse(savedReadingStr);
            if (parsedReading) {
              readingToUse = parsedReading;
            }
          }
        } catch (e) {
          console.error('Error parsing reading from localStorage in sendMessage:', e);
          localStorage.removeItem(STORAGE_KEYS.CURRENT_READING);
        }
      }

      if (!readingToUse) {
        console.error('No valid reading found when trying to send message');
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I apologize, but I don't have information about your reading. Please generate a new reading first.",
          },
        ]);
        return;
      }

      // Normalize the reading structure
      const hasDataProperty = readingToUse && 'data' in readingToUse && readingToUse.data;
      const hexagramNumber = hasDataProperty
        ? readingToUse.data.hexagram_number
        : (readingToUse as any).hexagram_number;
      const hexagramName = hasDataProperty ? readingToUse.data.reading.name : (readingToUse as any).reading.name;
      const hexagramChinese = hasDataProperty
        ? readingToUse.data.reading.chinese
        : (readingToUse as any).reading.chinese;
      const changingLines = hasDataProperty ? readingToUse.data.changing_lines : (readingToUse as any).changing_lines;
      const relatingHexagram = hasDataProperty
        ? readingToUse.data.relating_hexagram
        : (readingToUse as any).relatingHexagram;

      if (!hexagramNumber || !hexagramName) {
        console.error('Reading is missing hexagram number or name');
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              "I apologize, but I don't have complete information about your reading. Please generate a new reading.",
          },
        ]);
        return;
      }

      // Create context with the reading data
      const userMessageWithContext = `
${SYSTEM_INSTRUCTION}
READING INFORMATION:
- Primary Hexagram: ${hexagramNumber} - ${hexagramName} (${hexagramChinese || ''})
- Changing Lines: ${changingLines && changingLines.length > 0 ? changingLines.join(', ') : 'None'}
- Relating Hexagram: ${relatingHexagram ? `${relatingHexagram.number} - ${relatingHexagram.name}` : 'None'}
USER QUESTION: ${content}
`;

      console.log('Sending message to Gemini with reading context');
      // Create a simple chat with only the current exchange
      const result = await model.generateContent(userMessageWithContext);
      const response = await result.response;
      const botReply = response.text();

      // Add the response to chat history
      setChatHistory((prev) => [...prev, { role: 'assistant', content: botReply }]);
    } catch (e) {
      console.error('Error sending message:', e);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error processing your message. Please try again.',
        },
      ]);
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setIsChatEnabled(false);
    console.log('Chat cleared');
  };

  return {
    interpretation,
    chatHistory,
    isLoading,
    isEnhancedLoading,
    error,
    getInterpretation,
    getEnhancedInterpretation,
    startChat: startAiChat,
    sendMessage,
    clearChat,
    isChatEnabled,
  };
}
