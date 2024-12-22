import { Request, Response } from 'express'
import { handleChatMessage as geminiChat, getEnhancedInterpretation as geminiEnhanced } from '../lib/gemini'
import { z } from 'zod'
import { AdjustedHexagramData, AdjustedHexagramSchema } from '../types/hexagram'

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
})

export async function startChat(req: Request, res: Response) {
  try {
    res.json({ 
      message: "Welcome to the I Ching consultation. How may I assist you today?"
    })
  } catch (error) {
    console.error('Error starting chat:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to start chat' 
    })
  }
}

export async function handleChatMessage(req: Request, res: Response) {
  try {
    const { role, content } = MessageSchema.parse(req.body)
    
    // Get response from Gemini
    const response = await geminiChat(content)

    res.json({ 
      message: response
    })
  } catch (error) {
    console.error('Error in chat message handler:', error)
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to process chat message' 
    })
  }
}

export async function getEnhancedInterpretation(req: Request, res: Response) {
  try {
    const hexagramResult = AdjustedHexagramSchema.safeParse(req.body)
    
    if (!hexagramResult.success) {
      return res.status(400).json({ 
        error: 'Invalid hexagram data',
        details: hexagramResult.error.format()
      })
    }

    const hexagram = hexagramResult.data as AdjustedHexagramData
    const interpretation = await geminiEnhanced(hexagram)
    
    return res.json({ interpretation })
  } catch (error) {
    console.error('Error in enhanced interpretation:', error)
    return res.status(500).json({ error: 'Failed to generate interpretation' })
  }
}