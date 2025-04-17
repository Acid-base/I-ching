import { useState } from "react";
import { castHexagram } from "../services/api";
import {
  DivinationMethod,
  HexagramReading,
  ReadingRequest,
} from "../types/hexagram";

interface UseHexagramReturn {
  hexagram: HexagramReading | null;
  loading: boolean;
  error: Error | null;
  generateHexagram: (question: string) => Promise<void>;
}

export const useHexagram = (): UseHexagramReturn => {
  const [hexagram, setHexagram] = useState<HexagramReading | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const generateHexagram = async (question: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Starting reading generation...");

      // Create request with the proper format for the FastAPI backend
      const request: ReadingRequest = {
        question,
        mode: DivinationMethod.YARROW_STALKS,
        verbose: true,
      };

      // Call API to generate hexagram
      const result = await castHexagram(question);
      setHexagram(result);

      console.log("Reading generation completed:", result);
    } catch (err) {
      console.error("Error generating hexagram:", err);
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    hexagram,
    loading,
    error,
    generateHexagram,
  };
};

export default useHexagram;
