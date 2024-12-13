import { z } from 'zod'
import { ReadingSchema, type Reading } from '@/types'
import { axios } from './axios'

export const hexagramService = {
  generateReading: async (mode: 'yarrow' | 'coin'): Promise<Reading> => {
    const { data } = await axios.post('/api/generate', { mode })
    return ReadingSchema.parse(data)
  },

  getInterpretation: async (reading: Reading): Promise<string> => {
    const { data } = await axios.post('/api/interpret', { reading })
    return z.string().parse(data.interpretation)
  }
} 