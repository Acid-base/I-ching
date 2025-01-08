import { useState, useEffect } from 'react'
import axios from 'axios'
import { Reading } from '../types'
import { interpretHexagram, startChat, sendChatMessage } from '@services/api'

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
    setIsLoading(true)
    setError(null)
    try {
      setInterpretation(reading.interpretation)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to get interpretation'))
    } finally {
      setIsLoading(false)
    }
  }

  const getEnhancedInterpretation = async (hexagramNumber: number) => {
    setIsEnhancedLoading(true)
    try {
      const response = await interpretHexagram(hexagramNumber)
      setInterpretation(response.data.interpretation)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get enhanced interpretation')
    } finally {
      setIsEnhancedLoading(false)
    }
  }

  const startAiChat = async () => {
    try {
      await startChat()
      setIsChatEnabled(true)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to start chat'))
    }
  }

  const sendMessage = async (content: string) => {
    try {
      setChatHistory(prev => [...prev, { role: 'user', content }])
      const response = await sendChatMessage(content)
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.data.message }])
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to send message'))
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
    startChat: startAiChat,
    sendMessage,
    clearChat,
    isChatEnabled
  }
}