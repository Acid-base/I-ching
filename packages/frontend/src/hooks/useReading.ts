import type { HexagramMode } from '@/types';
import { generateReading } from '@services/api';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 seconds timeout

export function useReading() {
  const [mode, setMode] = useState<HexagramMode>('yarrow');

  const mutation = useMutation({
    mutationFn: () => generateReading(mode),
    onError: (error) => {
      console.error('Failed to generate reading:', error);
    },
  });

  return {
    reading: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    generate: () => mutation.mutate(),
    setMode,
  };
}
