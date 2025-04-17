import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useState } from 'react';
import { HexagramMode, type ReadingResponse } from '../types';

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.timeout = 10000; // 10 seconds timeout

type HexagramState = ReadingResponse | null;

interface UseHexagramResult {
  reading: HexagramState;
  isGenerating: boolean;
  generateError: Error | null;
  generate: () => Promise<any>;
  interpretation: string | null;
  isInterpreting: boolean;
  getInterpretation: (readingData?: ReadingResponse) => Promise<void>;
  clearReading: () => void;
  mode: HexagramMode;
  setMode: (mode: HexagramMode) => void;
}

// Local fallback generator when API is unavailable
const generateLocalHexagram = (method: HexagramMode) => {
  // Generate 6 random lines
  const generateLines = () => {
    const lines = [];
    for (let i = 0; i < 6; i++) {
      // For yarrow method: 6, 7, 8, 9 (with different probabilities)
      // For coins method: 6, 7, 8, 9 (with equal probabilities)
      if (method === HexagramMode.YARROW) {
        // Approximating yarrow probabilities: 6:25%, 7:31.25%, 8:43.75%, 9:18.75%
        const rand = Math.random();
        if (rand < 0.1875)
          lines.push('9'); // Old Yang
        else if (rand < 0.5)
          lines.push('7'); // Young Yang
        else if (rand < 0.75)
          lines.push('8'); // Young Yin
        else lines.push('6'); // Old Yin
      } else {
        // Coins method has equal probability for changing/unchanging yin/yang
        const rand = Math.random();
        if (rand < 0.25)
          lines.push('9'); // Old Yang
        else if (rand < 0.5)
          lines.push('7'); // Young Yang
        else if (rand < 0.75)
          lines.push('8'); // Young Yin
        else lines.push('6'); // Old Yin
      }
    }
    return lines;
  };

  // Get the changing lines (6 or 9)
  const getChangingLines = (lines: string[]) => {
    return lines.map((line, index) => (line === '6' || line === '9' ? index + 1 : null)).filter(Boolean) as number[];
  };

  // Get hexagram number (simplified for fallback - just use a number between 1-64)
  const getHexagramNumber = () => {
    return Math.floor(Math.random() * 64) + 1;
  };

  const lines = generateLines();
  const changingLines = getChangingLines(lines);
  const hexagramNumber = getHexagramNumber();

  // Create a mock reading object that matches the API response structure
  return {
    data: {
      hexagram_number: hexagramNumber,
      changing_lines: changingLines,
      lines: lines,
      reading: {
        number: hexagramNumber,
        name: `Hexagram ${hexagramNumber}`,
        chinese: '易經',
        judgment: 'This is a locally generated fallback reading. The API appears to be unavailable.',
        image: 'When the API is unavailable, the wise person creates their own path.',
        lines: [],
      },
      relating_hexagram:
        changingLines.length > 0
          ? {
              number: Math.floor(Math.random() * 64) + 1,
              name: 'Relating Hexagram',
              judgment: 'This relating hexagram is simulated as the API is currently unavailable.',
              image: 'When connections fail, one must find meaning within.',
            }
          : undefined,
    },
  } as ReadingResponse;
};

export function useHexagram(): UseHexagramResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<HexagramMode>(HexagramMode.YARROW);
  const [reading, setReading] = useState<HexagramState>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<Error | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        setIsGenerating(true);
        // Use the existing endpoint for all methods
        // The /cast endpoint doesn't exist, so we'll always use /reading/generate
        const response = await axios.post(`${API_URL}/reading/generate`, {
          mode: mode === HexagramMode.YARROW ? 'yarrow' : 'coins', // Use 'coins' to match backend expectation
          verbose: false,
        });
        return response.data;
      } catch (error) {
        console.error('Mutation error:', error);
        // Use local hexagram generation as fallback when API fails
        console.log('API unavailable, using local fallback generator');
        return generateLocalHexagram(mode);
      } finally {
        setIsGenerating(false);
      }
    },
    onSuccess: (data) => {
      setReading(data);
      // Show notification if this was a fallback reading
      if (data && data.data?.reading?.judgment?.includes('locally generated fallback')) {
        console.warn('Using locally generated fallback reading');
        // We could add a toast notification here if we had access to the toast function
      }
    },
    onError: (error) => {
      console.error('Failed to generate reading:', error);
      setGenerateError(error instanceof Error ? error : new Error('Failed to generate reading'));
    },
  });

  // Get interpretation for a reading
  const getInterpretation = useCallback(
    async (readingData?: ReadingResponse) => {
      const dataToUse = readingData || reading;
      console.log('Getting interpretation for:', dataToUse);
      if (!dataToUse) return;

      try {
        setIsInterpreting(true);

        const hexagramNumber = dataToUse.data?.hexagram_number || (dataToUse as any).hexagram_number;
        const readingObj = dataToUse.data?.reading || (dataToUse as any).reading;

        if (!hexagramNumber) {
          console.error('Invalid reading data structure:', dataToUse);
          return;
        }

        const cacheKey = ['interpretation', hexagramNumber];
        const cachedInterpretation = queryClient.getQueryData<string>(cacheKey);

        if (cachedInterpretation) {
          console.log('Using cached interpretation');
          setInterpretation(cachedInterpretation);
          return;
        }

        // Check if we're using a fallback reading
        if (readingObj.judgment?.includes('locally generated fallback')) {
          const fallbackInterpretation = `This is a locally generated reading as the API is currently unavailable.

Hexagram ${hexagramNumber} represents one of the 64 possible combinations in the I Ching.

In a full reading, you would receive traditional interpretations of the hexagram's meaning, along with insights about any changing lines.

To see the full functionality of this application, please ensure the backend server is running.`;

          setInterpretation(fallbackInterpretation);
          queryClient.setQueryData(cacheKey, fallbackInterpretation);
          return;
        }

        console.log('Fetching interpretation...');
        try {
          const response = await axios.post(`${API_URL}/reading/interpret`, {
            reading: readingObj,
            hexagram_number: hexagramNumber,
          });

          console.log('Interpretation response:', response.data);
          setInterpretation(response.data.interpretation);
          queryClient.setQueryData(cacheKey, response.data.interpretation);
        } catch (err) {
          console.error('API error getting interpretation, using fallback:', err);
          // Generate a simple fallback interpretation
          const fallbackInterpretation = `Hexagram ${hexagramNumber}: ${readingObj.name}

This is a simplified interpretation as the API service is currently unavailable.

The I Ching invites you to reflect on your question in relation to the symbols and elements presented in this hexagram.

${readingObj.judgment || ''}

${readingObj.image || ''}`;

          setInterpretation(fallbackInterpretation);
          queryClient.setQueryData(cacheKey, fallbackInterpretation);
        }
      } catch (error) {
        console.error('Failed to get interpretation:', error);
      } finally {
        setIsInterpreting(false);
      }
    },
    [queryClient, reading]
  );

  const clearReading = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['reading'] });
    setInterpretation(null);
    setReading(null);
  }, [queryClient]);

  return {
    reading,
    isGenerating: mutation.isPending,
    generateError: generateError,
    generate: () => mutation.mutate(),
    interpretation,
    isInterpreting,
    getInterpretation,
    clearReading,
    mode,
    setMode,
  };
}
