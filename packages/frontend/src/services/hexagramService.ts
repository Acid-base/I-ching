import axios from 'axios';
import { HexagramMode, Reading, ReadingResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface CastHexagramParams {
  mode: HexagramMode;
  verbose?: boolean;
  seed?: number | null;
}

export const hexagramService = {
  // Standardized method that uses the correct endpoint and parameter names
  generateReading: async (mode: HexagramMode): Promise<ReadingResponse> => {
    const { data } = await axios.post(`${API_URL}/reading/generate`, {
      mode: mode === 'coin' ? 'coins' : mode, // Normalize 'coin' to 'coins' to match backend
      verbose: false,
    });
    return data;
  },

  getHexagramById: async (id: number): Promise<Reading> => {
    const { data } = await axios.get(`${API_URL}/reading/${id}`);
    return data.data.reading;
  },

  getInterpretation: async (readingData: ReadingResponse): Promise<string> => {
    const { data } = await axios.post(`${API_URL}/chat/interpret`, { reading: readingData.data.reading });
    return data.interpretation;
  },
  // Add consistent method for castHexagram that uses the standard endpoint
  castHexagram: async ({ mode, verbose = false, seed = null }: CastHexagramParams): Promise<ReadingResponse> => {
    try {
      // Always use the reading/generate endpoint for consistency
      const response = await axios.post(`${API_URL}/reading/generate`, {
        mode: mode === 'coin' ? 'coins' : mode, // Normalize to match backend expectations
        verbose,
        seed,
      });
      return response.data;
    } catch (error) {
      console.error('Error casting hexagram:', error);
      throw error;
    }
  },
};
