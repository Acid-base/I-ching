import type { ReadingResponse } from '@/types';
import { generateReading } from '@services/api';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import { hexagramService } from '../services/hexagramService';

interface UseHexagramResult {
  reading: ReadingResponse | null;
  isGenerating: boolean;
  generateError: Error | null;
  generate: () => Promise<void>;
  interpretation: string | null;
  isInterpreting: boolean;
  getInterpretation: () => Promise<void>;
  clearReading: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CACHE_TIME = 1000 * 60 * 60; // 1 hour

export function useHexagram(): UseHexagramResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'yarrow' | 'coin'>('yarrow');
  const [reading, setReading] = useState<ReadingResponse | null>(null);
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

  const generate = async () => {
    console.log('Generating reading...');
    setIsGenerating(true);
    setGenerateError(null);
    try {
      console.log('Calling generateReading API...');
      const response = await generateReading('yarrow');
      console.log('API response received:', response);
      setReading(response);
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
    async (readingData: ReadingResponse) => {
      console.log('Getting interpretation for:', readingData);
      if (!readingData) return;

      try {
        setIsInterpreting(true);
        const cacheKey = ['interpretation', readingData.hexagram_number];
        const cachedInterpretation = queryClient.getQueryData<string>(cacheKey);

        if (cachedInterpretation) {
          console.log('Using cached interpretation');
          setInterpretation(cachedInterpretation);
          return;
        }

        console.log('Fetching interpretation...');
        const response = await axios.post(`${API_URL}/reading/interpret`, { reading: readingData });
        console.log('Interpretation response:', response.data);
        setInterpretation(response.data.interpretation);
        queryClient.setQueryData(cacheKey, response.data.interpretation);
      } catch (error) {
        console.error('Failed to get interpretation:', error);
      } finally {
        setIsInterpreting(false);
      }
    },
    [queryClient]
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
    setMode,
  };
}
