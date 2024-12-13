import { useMutation } from '@tanstack/react-query'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

// Configure axios defaults
axios.defaults.timeout = 10000 // 10 seconds timeout

interface HexagramReading {
  name: string
  chinese: string
  description: string
  judgment: string
  image: string
  lines: Record<string, string>
}

interface RelatingHexagram {
  number: number
  name: string
  chinese: string
  description: string
}

interface Reading {
  hexagram_number: number
  changing_lines: number[]
  lines: number[]
  reading: HexagramReading
  relating_hexagram: RelatingHexagram | null
  ai_interpretation?: string
}

export function useReading() {
  const mutation = useMutation({
    mutationFn: async (): Promise<Reading> => {
      const response = await axios.post(`${API_URL}/reading`)
      return response.data
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.')
        } else if (error.response?.data?.error) {
          throw new Error(error.response.data.error)
        } else {
          throw new Error('Failed to connect to server')
        }
      } else {
        throw new Error('Failed to generate reading')
      }
    },
  })

  return {
    reading: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error?.message,
    generateReading: () => mutation.mutate(),
  }
} 