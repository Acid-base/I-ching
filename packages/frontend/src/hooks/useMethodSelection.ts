import { hexagramService } from '@/services/hexagramService';
import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

type DivinationMethod = 'yarrow' | 'coins';

export function useMethodSelection() {
  const [selectedMethod, setSelectedMethod] = useState<DivinationMethod>('yarrow');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSelectMethod = async (method: DivinationMethod) => {
    setSelectedMethod(method);
    setIsLoading(true);
    setError(null);

    try {
      // Use the hexagramService instead of direct axios call
      const response = await hexagramService.castHexagram({
        mode: method,
        verbose: false,
      });

      setResult(response);
      return response;
    } catch (err) {
      console.error('Error casting with method:', err);
      setError(err instanceof Error ? err.message : 'Failed to cast hexagram');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSelectMethod,
    selectedMethod,
    isLoading,
    error,
    result,
  };
}
