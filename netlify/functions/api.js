import express from "express"
import serverless from "serverless-http"

const app = express()

// Parse JSON bodies
app.use(express.json())

// Example routes (note the '/api' prefix is required when using redirects)
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express on Netlify!" })
})

app.get("/api/time", (req, res) => {
  res.json({ now: new Date().toISOString() })
})

app.post("/api/echo", (req, res) => {
  res.json({ youSent: req.body ?? null })
})

// Export the Netlify serverless handler
export const handler = serverless(app)
