import { z } from 'zod'
import { ReadingSchema, type Reading } from '@/types'
import axios from 'axios'
import type { ReadingResponse } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const hexagramService = {
  generateReading: async (mode: 'yarrow' | 'coin'): Promise<ReadingResponse> => {
    const { data } = await axios.post(`${API_URL}/reading/generate`, { mode })
    return data
  },

  getHexagramById: async (id: number): Promise<ReadingResponse['reading']> => {
    const { data } = await axios.get(`${API_URL}/reading/${id}`)
    return data
  },

  getInterpretation: async (reading: ReadingResponse): Promise<string> => {
    const { data } = await axios.post(`${API_URL}/chat/interpret`, { reading })
    return data.interpretation
  }
}