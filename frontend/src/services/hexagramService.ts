import axios from 'axios';
import { Hexagram } from '../types/hexagram';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchHexagram = async (hexagramNumber: number): Promise<Hexagram> => {
  try {
    const response = await axios.get(`${API_URL}/hexagrams/${hexagramNumber}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching hexagram data:', error);
    throw error;
  }
};

export const castHexagram = async (method: 'yarrow' | 'coins'): Promise<{ 
  hexagram: Hexagram;
  changingLines: number[];
  relatedHexagram?: Hexagram;
}> => {
  try {
    const response = await axios.post(`${API_URL}/cast`, { method });
    return response.data;
  } catch (error) {
    console.error('Error casting hexagram:', error);
    throw error;
  }
};
