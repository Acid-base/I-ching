import { Router } from 'express'
import { hexagramRoutes } from './hexagram'

const router = Router()

router.use('/hexagrams', hexagramRoutes)

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

export default router 