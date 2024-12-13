import { Request, Response } from 'express'
import { handleChatMessage as geminiChat, getEnhancedInterpretation as geminiEnhanced } from '../lib/gemini'
import { z } from 'zod'
import { HexagramData } from '../types/hexagram'

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string()
})

// Validation schema for hexagram data
const HexagramSchema = z.object({
  number: z.number(),
  name: z.string(),
  chinese: z.string(),
  description: z.string(),
  alternate_names: z.array(z.string()),
  element: z.string(),
  attribute: z.string(),
  judgment: z.union([
    z.string(),
    z.object({
      text: z.string(),
      explanation: z.string()
    })
  ]),
  image: z.union([
    z.string(),
    z.object({
      text: z.string(),
      explanation: z.string()
    })
  ]),
  nuclear: z.object({
    upper: z.number().nullable(),
    lower: z.number().nullable()
  }),
  reversed: z.number().nullable(),
  opposite: z.number(),
  lines: z.array(z.object({
    number: z.number(),
    value: z.number(),
    meaning: z.string(),
    transforms_to: z.number().nullable().optional()
  })),
  trigrams: z.object({
    upper: z.object({
      name: z.string(),
      attribute: z.string(),
      chinese: z.string(),
      element: z.string(),
      image: z.string()
    }),
    lower: z.object({
      name: z.string(),
      attribute: z.string(),
      chinese: z.string(),
      element: z.string(),
      image: z.string()
    })
  })
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
    const hexagramResult = HexagramSchema.safeParse(req.body)
    
    if (!hexagramResult.success) {
      return res.status(400).json({ 
        error: 'Invalid hexagram data',
        details: hexagramResult.error.format()
      })
    }

    const hexagram = hexagramResult.data as HexagramData
    const interpretation = await geminiEnhanced(hexagram)
    
    return res.json({ interpretation })
  } catch (error) {
    console.error('Error in enhanced interpretation:', error)
    return res.status(500).json({ error: 'Failed to generate interpretation' })
  }
} 