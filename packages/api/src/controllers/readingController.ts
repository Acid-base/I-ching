import { Request, Response } from 'express'
import { generateReading, getHexagramById } from '../services/hexagramService'

export async function getReading(req: Request, res: Response) {
  try {
    const reading = await generateReading()
    res.json(reading)
  } catch (error) {
    console.error('Error in getReading:', error)
    res.status(500).json({ error: 'Failed to generate reading' })
  }
}

export async function getHexagram(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id) || id < 1 || id > 64) {
      return res.status(400).json({ error: 'Invalid hexagram ID' })
    }

    const hexagram = await getHexagramById(id)
    res.json(hexagram)
  } catch (error) {
    console.error('Error in getHexagram:', error)
    res.status(500).json({ error: 'Failed to get hexagram' })
  }
} 