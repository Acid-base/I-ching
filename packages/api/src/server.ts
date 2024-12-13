import { createApp } from './config/express'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT || 8000
const app = createApp()

function startServer() {
  try {
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`)
    })
  } catch (error) {
    console.error('Error starting server:', error)
    process.exit(1)
  }
}

// Handle uncaught errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err)
  process.exit(1)
})

export { app, startServer } 