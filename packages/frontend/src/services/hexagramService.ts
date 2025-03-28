import { type Reading, type ReadingResponse } from '@/types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const hexagramService = {
  generateReading: async (mode: 'yarrow' | 'coin'): Promise<ReadingResponse> => {
    const { data } = await axios.post(`${API_URL}/reading/generate`, { mode });
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
};
