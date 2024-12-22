import { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReadingResponse } from '../types';
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const CACHE_TIME = 1000 * 60 * 60; // 1 hour

export function useHexagram(): UseHexagramResult {
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'yarrow' | 'coin'>('yarrow');

  // Memoize the query configuration
  const queryConfig = useMemo(() => ({
    queryKey: ['reading', mode],
    queryFn: () => hexagramService.generateReading(mode),
    enabled: false,
    cacheTime: CACHE_TIME,
    staleTime: CACHE_TIME,
  }), [mode]);

  const { 
    data: reading,
    isLoading: isGenerating,
    error: generateError,
    refetch: generate
  } = useQuery(queryConfig);

  // Memoize interpretation function
  const getInterpretation = useCallback(async () => {
    if (!reading) return;

    try {
      setIsInterpreting(true);
      const cacheKey = ['interpretation', reading.hexagram_number];
      const cachedInterpretation = queryClient.getQueryData<string>(cacheKey);
      
      if (cachedInterpretation) {
        setInterpretation(cachedInterpretation);
        return;
      }

      const response = await axios.post(`${API_URL}/reading/interpret`, { reading });
      setInterpretation(response.data.interpretation);
      queryClient.setQueryData(cacheKey, response.data.interpretation);
    } catch (error) {
      console.error('Failed to get interpretation:', error);
    } finally {
      setIsInterpreting(false);
    }
  }, [reading, queryClient]);

  const clearReading = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['reading'] });
    setInterpretation(null);
  }, [queryClient]);

  return {
    reading: reading || null,
    isGenerating,
    generateError: generateError ? new Error(generateError.message) : null,
    generate: () => generate(),
    interpretation,
    isInterpreting,
    getInterpretation,
    clearReading,
    setMode,
  };
}