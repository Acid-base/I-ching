import { useState, useEffect } from 'react'
import axios from 'axios'
import { Reading } from '../types'

const API_URL = 'http://localhost:8000/api'

interface ChatMessage {
  role: string
  content: string
}

interface StoredInterpretation {
  reading: Reading
  interpretation: string
  timestamp: number
}

interface UseAiInterpreterResult {
  interpretation: string | null
  chatHistory: ChatMessage[]
  isLoading: boolean
  isEnhancedLoading: boolean
  error: string | null
  getInterpretation: (reading: Reading) => Promise<void>
  getEnhancedInterpretation: (hexagramNumber: number) => Promise<void>
  startChat: () => Promise<void>
  sendMessage: (content: string) => Promise<void>
  clearChat: () => void
  isChatEnabled: boolean
}

const STORAGE_KEYS = {
  CHAT_HISTORY: 'iching_chat_history',
  INTERPRETATIONS: 'iching_interpretations',
} as const

export function useAiInterpreter(): UseAiInterpreterResult {
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)
    return stored ? JSON.parse(stored) : []
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isEnhancedLoading, setIsEnhancedLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isChatEnabled, setIsChatEnabled] = useState(false)

  // Persist chat history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(chatHistory))
  }, [chatHistory])

  const getInterpretation = async (reading: Reading) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.post(`${API_URL}/reading/interpret`, reading)
      const newInterpretation = response.data.interpretation

      // Store interpretation with reading and timestamp
      const stored: StoredInterpretation[] = JSON.parse(
        localStorage.getItem(STORAGE_KEYS.INTERPRETATIONS) || '[]'
      )
      stored.push({
        reading,
        interpretation: newInterpretation,
        timestamp: Date.now(),
      })
      localStorage.setItem(STORAGE_KEYS.INTERPRETATIONS, JSON.stringify(stored))

      setInterpretation(newInterpretation)
      setIsChatEnabled(true) // Enable chat immediately after getting interpretation
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to get AI interpretation')
      }
      console.error('Interpretation error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getEnhancedInterpretation = async (hexagramNumber: number) => {
    try {
      setIsEnhancedLoading(true)
      setError(null)

      // First, get the full hexagram data
      const hexagramResponse = await axios.get(`${API_URL}/hexagrams/${hexagramNumber}`)
      const hexagramData = hexagramResponse.data

      // Then get the enhanced interpretation
      const enhancedResponse = await axios.post(`${API_URL}/chat/enhanced`, { hexagram: hexagramData })
      const newInterpretation = enhancedResponse.data.interpretation

      setInterpretation(newInterpretation)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to get enhanced interpretation')
      }
      console.error('Enhanced interpretation error:', err)
    } finally {
      setIsEnhancedLoading(false)
    }
  }

  const startChat = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await axios.post(`${API_URL}/chat/start`)
      const initialMessage = { role: 'assistant', content: response.data.message }
      setChatHistory([initialMessage])
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to start chat')
      }
      console.error('Chat start error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Add user message to history
      const userMessage: ChatMessage = { role: 'user', content }
      setChatHistory(prev => [...prev, userMessage])

      // Send message to API
      const response = await axios.post(`${API_URL}/chat/message`, userMessage)
      
      // Add assistant response to history
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.data.message }
      setChatHistory(prev => [...prev, assistantMessage])
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setError(err.response.data.detail)
      } else {
        setError('Failed to send message')
      }
      // Don't throw here to keep the user message in history even if API fails
      console.error('Chat error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setChatHistory([])
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY)
    setIsChatEnabled(false)
  }

  return {
    interpretation,
    chatHistory,
    isLoading,
    isEnhancedLoading,
    error,
    getInterpretation,
    getEnhancedInterpretation,
    startChat,
    sendMessage,
    clearChat,
    isChatEnabled
  }
} 