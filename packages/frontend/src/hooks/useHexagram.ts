import { type ReadingResponse } from '@/types';
import { generateReading } from '@services/api';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { hexagramService } from '../services/hexagramService';

// Define a consistent type that matches the actual API response structure
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
  setMode?: (mode: 'yarrow' | 'coin') => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CACHE_TIME = 1000 * 60 * 60; // 1 hour

export function useHexagram(): UseHexagramResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'yarrow' | 'coin'>('yarrow');
  const [reading, setReading] = useState<HexagramState>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<Error | null>(null);

  // Memoize the query configuration
  const queryConfig = useMemo(
    () => ({
      queryKey: ['reading', mode],
      queryFn: () => hexagramService.generateReading(mode),
      enabled: false,
      cacheTime: CACHE_TIME,
      staleTime: CACHE_TIME,
    }),
    [mode]
  );

  const generate = async (): Promise<any> => {
    console.log('Generating reading...');
    setIsGenerating(true);
    setGenerateError(null);
    try {
      console.log('Calling generateReading API...');
      const response = await generateReading('yarrow');
      console.log('API response received:', response);
      // Use type assertion to ensure TypeScript understands the structure
      setReading(response as any);
      return response;
    } catch (error) {
      console.error('Error generating reading:', error);
      setGenerateError(error instanceof Error ? error : new Error('Failed to generate reading'));
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  // Memoize interpretation function
  const getInterpretation = useCallback(
    async (readingData?: ReadingResponse) => {
      const dataToUse = readingData || reading;
      console.log('Getting interpretation for:', dataToUse);
      if (!dataToUse) return;

      try {
        setIsInterpreting(true);

        // Safely access properties using type guards to handle both possible structures
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

        console.log('Fetching interpretation...');
        const response = await axios.post(`${API_URL}/reading/interpret`, {
          reading: readingObj,
          hexagram_number: hexagramNumber,
        });

        console.log('Interpretation response:', response.data);
        setInterpretation(response.data.interpretation);
        queryClient.setQueryData(cacheKey, response.data.interpretation);
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
  }, [queryClient]);

  return {
    reading,
    isGenerating,
    generateError: generateError ? new Error(generateError.message) : null,
    generate,
    interpretation,
    isInterpreting,
    getInterpretation,
    clearReading,
  };
}
