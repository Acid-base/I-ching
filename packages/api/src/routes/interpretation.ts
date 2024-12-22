import { Router } from 'express'
import { interpretHexagram, getLineInterpretation, interpretChangingLines, interpretRelationship } from '../lib/genai'
import { HexagramSchema } from '../types/schemas'
import { ReadingResponse } from '../types/hexagram'

const router = Router()

router.post('/hexagram', async (req, res) => {
  try {
    const { hexagram, question } = req.body
    const validatedHexagram = HexagramSchema.parse(hexagram)
    const interpretation = await interpretHexagram(validatedHexagram, question)
    res.json({ interpretation })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate interpretation' })
  }
})

router.post('/line', async (req, res) => {
  try {
    const { hexagram, lineNumber } = req.body
    const validatedHexagram = HexagramSchema.parse(hexagram)
    const interpretation = await getLineInterpretation(validatedHexagram, lineNumber)
    res.json({ interpretation })
  } catch (error) {
    res.status(500).json({ error: 'Failed to interpret line' })
  }
})

router.post('/comprehensive', async (req, res) => {
  try {
    const reading: ReadingResponse = req.body.reading
    
    const [
      basicInterpretation,
      changingLineInterpretations,
      relationshipInterpretation
    ] = await Promise.all([
      interpretHexagram(reading.reading, reading.changing_lines),
      reading.changing_lines.length > 0 
        ? interpretChangingLines(reading.reading, reading.changing_lines)
        : Promise.resolve([]),
      reading.relating_hexagram
        ? interpretRelationship(reading.reading, reading.relating_hexagram)
        : Promise.resolve(null)
    ])

    res.json({
      basic: basicInterpretation,
      changingLines: changingLineInterpretations,
      relationship: relationshipInterpretation
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate interpretation' })
  }
})

export { router as interpretationRoutes }
