import { useState } from "react";
import { fetchHexagram } from "../services/hexagramService";

// Type for the hexagram reading result
export interface HexagramReading {
  hexagram_number: number;
  changing_lines: number[];
  lines: string[];
  reading: any;
  relating_hexagram?: any;
}

// Hook for handling hexagram generation and state
export function useHexagram() {
  const [reading, setReading] = useState<HexagramReading | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<Error | null>(null);

  // Function to generate a new hexagram reading
  const generate = async (
    method: "yarrow" | "coins" = "yarrow",
  ): Promise<HexagramReading> => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const response = await fetchHexagram(method);
      setReading(response);
      return response;
    } catch (error) {
      console.error("Error generating hexagram:", error);
      const err =
        error instanceof Error
          ? error
          : new Error("Failed to generate hexagram");
      setGenerateError(err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    reading,
    isGenerating,
    generateError,
    generate,
  };
}
