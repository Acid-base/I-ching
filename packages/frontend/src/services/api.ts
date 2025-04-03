import { HexagramMode, type ReadingResponse } from '@/types';
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
  generateReading: async (mode: HexagramMode): Promise<ReadingResponse> => {
    try {
      const response = await axios.post(`${API_URL}/cast`, {
        mode: mode,
        verbose: false,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating reading:', error);
      throw error;
    }
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
