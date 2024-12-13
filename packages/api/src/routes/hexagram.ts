import { Router } from 'express'
import { z } from 'zod'
import { interpretReading } from '../lib/gemini'
import { PythonShell } from 'python-shell'
import path from 'path'
import type { HexagramReading } from '../types'
import readings from '../../../core/src/data/readings.json'

const router = Router()

const GenerateReadingSchema = z.object({
  mode: z.enum(['yarrow', 'coin']).optional().default('yarrow'),
})

router.post('/generate', async (req, res, next) => {
  try {
    const { mode } = GenerateReadingSchema.parse(req.body)
    
    // Fix path resolution by going up to project root first
    const projectRoot = path.resolve(__dirname, '../../../..')
    const pythonPath = path.join(projectRoot, 'packages/core/src')
    const options = {
      mode: 'json' as const,
      pythonPath: 'python',
      pythonOptions: ['-u'],
      scriptPath: pythonPath,
      args: [JSON.stringify({ mode })]
    }

    console.log('Python script path:', path.join(pythonPath, 'divination.py'))
    const results = await PythonShell.run('divination.py', options)
    
    if (!results || results.length === 0) {
      throw new Error('No results returned from Python script')
    }

    const result = results[0]
    
    // Check if the result is an error response from Python
    if (result.error) {
      throw new Error(`Python script error: ${result.error} (${result.type})`)
    }

    // Get AI interpretation if available
    const reading = await interpretReading(result)
    
    res.json({ ...result, reading })
  } catch (error) {
    console.error('Error generating reading:', error)
    next(error)
  }
})

router.get('/:number', async (req, res) => {
  try {
    const number = parseInt(req.params.number)
    if (isNaN(number) || number < 1 || number > 64) {
      return res.status(400).json({ error: 'Invalid hexagram number' })
    }

    const hexagram = readings.find(h => h.number === number)
    if (!hexagram) {
      return res.status(404).json({ error: 'Hexagram not found' })
    }

    res.json(hexagram)
  } catch (error) {
    console.error('Error getting hexagram:', error)
    res.status(500).json({ error: 'Failed to get hexagram data' })
  }
})

export { router as hexagramRoutes } 