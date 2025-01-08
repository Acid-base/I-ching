import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { generateReading } from '@services/api'
import type { ReadingResponse } from '@/types'

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
  const [mode, setMode] = useState<'yarrow' | 'coin'>('yarrow')

  const mutation = useMutation({
    mutationFn: () => generateReading(mode),
    onError: (error) => {
      console.error('Failed to generate reading:', error)
    }
  })

  return {
    reading: mutation.data?.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    generate: () => mutation.mutate(),
    setMode
  }
}