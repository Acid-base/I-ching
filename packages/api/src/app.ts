import express from 'express'
import cors from 'cors'
import { healthCheck } from './controllers/healthController'
import { startChat, handleChatMessage, getEnhancedInterpretation } from './controllers/chatController'

const app = express()

app.use(cors())
app.use(express.json())

// Health check route
app.get('/api/health', healthCheck)

// Chat routes
app.post('/api/chat/start', startChat)
app.post('/api/chat/message', handleChatMessage)
app.post('/api/chat/enhanced', getEnhancedInterpretation)

export { app } 