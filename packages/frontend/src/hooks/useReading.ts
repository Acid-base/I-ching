import { HexagramMode, type ReadingResponse } from '@/types';
import { generateReading } from '@services/api';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

// Configure axios defaults
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.timeout = 10000; // 10 seconds timeout

export function useReading() {
  const [mode, setMode] = useState<HexagramMode>(HexagramMode.YARROW);

  const mutation = useMutation({
    mutationFn: () => generateReading(mode),
    onError: (error) => {
      console.error('Failed to generate reading:', error);
    },
  });

  return {
    reading: mutation.data as ReadingResponse | undefined,
    isLoading: mutation.isPending,
    error: mutation.error,
    generate: () => mutation.mutate(),
    mode,
    setMode,
  };
}
