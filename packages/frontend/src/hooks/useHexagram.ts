import { HexagramMode, type ReadingResponse } from '@/types';
import { generateReading } from '@services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useCallback } from 'react';

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

export function useHexagram(): UseHexagramResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<HexagramMode>(HexagramMode.YARROW);
  const [reading, setReading] = useState<HexagramState>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<Error | null>(null);

  const mutation = useMutation({
    mutationFn: () => generateReading(mode),
    onSuccess: (data) => {
      setReading(data);
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
