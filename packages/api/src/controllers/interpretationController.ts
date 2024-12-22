import { Request, Response } from 'express'
import { getAiInterpretation } from '../services/aiService'
import { z } from 'zod'

// Define a schema for the reading
const ReadingSchema = z.object({
  number: z.number(),
  lines: z.array(z.number()),
  // Add other properties as needed
});

export const interpretReading = async (req: Request, res: Response) => {
  try {
    const readingResult = ReadingSchema.safeParse(req.body.reading);

    if (!readingResult.success) {
      return res.status(400).json({ 
        error: 'Invalid reading data',
        details: readingResult.error.format()
      });
    }

    const reading = readingResult.data;
    const interpretation = await getAiInterpretation(reading)
    res.json({ interpretation })
  } catch (error) {
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to get interpretation' 
    })
  }
}