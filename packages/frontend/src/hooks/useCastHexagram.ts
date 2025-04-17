import { castHexagram } from '@/services/api';
import { HexagramMode, ReadingResponse } from '@/types';
import { useState } from 'react';

interface UseCastHexagramResult {
  reading: ReadingResponse | null;
  isLoading: boolean;
  error: string | null;
  cast: (mode: HexagramMode) => Promise<void>;
}

export function useCastHexagram(): UseCastHexagramResult {
  const [reading, setReading] = useState<ReadingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cast = async (mode: HexagramMode) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await castHexagram(mode);
      setReading(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to cast hexagram');
    } finally {
      setIsLoading(false);
    }
  };

  return { reading, isLoading, error, cast };
}
