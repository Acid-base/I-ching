import { HexagramReading } from '../types'

const API_URL = Deno.env.get('API_URL') || 'http://localhost:8000'

export async function getReading(data: {
  hexagram_number: number
  changing_lines: number[]
  lines: number[]
}): Promise<HexagramReading> {
  const response = await fetch(`${API_URL}/api/reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('Failed to get reading')
  }
  
  return response.json()
}

export async function getAiInterpretation(reading: HexagramReading): Promise<string> {
  const response = await fetch(`${API_URL}/api/ai-interpretation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reading })
  })
  
  if (!response.ok) {
    throw new Error('Failed to get AI interpretation')
  }
  
  return response.json()
} 