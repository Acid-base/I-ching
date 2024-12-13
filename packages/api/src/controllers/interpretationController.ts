import { Request, Response } from 'express'
import { getAiInterpretation } from '../services/aiService'

export const interpretReading = async (req: Request, res: Response) => {
  try {
    const reading = req.body.reading
    const interpretation = await getAiInterpretation(reading)
    res.json({ interpretation })
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get interpretation' 
    })
  }
} 