import { useState } from 'react'
import axios from 'axios'
import { Reading } from '../types'

const API_URL = 'http://localhost:8000/api'

export function useReading() {
  const [reading, setReading] = useState<Reading | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateReading = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.post<Reading>(`${API_URL}/reading`)
      setReading(response.data)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to generate reading')
      }
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    reading,
    isLoading,
    error,
    generateReading,
  }
} 