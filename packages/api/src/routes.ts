import { Router } from 'express'
import { getReading, getHexagram } from './controllers/readingController'

const router = Router()

// Reading routes
router.get('/reading', getReading)
router.get('/hexagram/:id', getHexagram)

export default router 