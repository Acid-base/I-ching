import type { ReadingResponse } from '@/types';
import axios from 'axios';

// Define ChatResponse type locally since it's missing from @/types
interface ChatResponse {
  success: boolean;
  data: {
    message: string;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Consolidate all API functions
export const apiService = {
  generateReading: async (mode: 'yarrow' | 'coin'): Promise<ReadingResponse> => {
    const { data } = await api.post('/cast', {
      mode,
      seed: null,
      verbose: false,
    });
    return data;
  },

  getHexagram: async (id: number) => {
    const { data } = await api.get(`/hexagrams/${id}`);
    return data;
  },

  interpretHexagram: async (hexagramNumber: number) => {
    const { data } = await api.post('/interpretations/hexagram', {
      hexagram_number: hexagramNumber,
    });
    return data;
  },

  getEnhancedInterpretation: async (hexagramNumber: number) => {
    const { data } = await api.post('/interpretations/comprehensive', {
      hexagram_number: hexagramNumber,
    });
    return data;
  },

  startChat: async () => {
    const { data } = await api.post<ChatResponse>('/chat/start');
    return data;
  },

  sendChatMessage: async (content: string) => {
    const { data } = await api.post<ChatResponse>('/chat/message', {
      role: 'user',
      content,
    });
    return data;
  },
};

// Named exports for backward compatibility
export const {
  generateReading,
  getHexagram,
  interpretHexagram,
  getEnhancedInterpretation,
  startChat,
  sendChatMessage,
} = apiService;

export interface ReadingResponse {
  success: boolean;
  data: {
    hexagram_number: number;
    changing_lines: number[];
    lines: number[];
    reading: {
      number: number;
      name: string;
      englishName: string;
      chinese: string;
      description: string;
      judgment: { text: string };
      image: { text: string };
      lines: string[];
    };
    interpretation: string;
  };
}
