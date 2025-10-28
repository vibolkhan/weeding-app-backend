import express from "express"
import serverless from "serverless-http"

const app = express()
app.use(express.json())

app.get("/api/hello", (req, res) => res.json({ message: "Hello from Express on Netlify!" }))
app.get("/api/time", (req, res) => res.json({ now: new Date().toISOString() }))
app.post("/api/echo", (req, res) => res.json({ youSent: req.body ?? null }))

export const handler = serverless(app)
