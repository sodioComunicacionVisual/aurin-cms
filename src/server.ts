import express from 'express'
import payload from 'payload'

const app = express()

// Initialize Payload
const start = async (): Promise<void> => {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    express: app,
    onInit: () => {
      payload.logger.info(`Payload Admin URL: ${payload.getAdminURL()}`)
    },
  })

  const port = process.env.PORT || 3000
  
  app.listen(port, async () => {
    payload.logger.info(`Server listening on port ${port}`)
  })
}

start()

export default app
