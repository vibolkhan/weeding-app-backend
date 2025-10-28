# Netlify Express API (Serverless)

This is a minimal Express API running on **Netlify Functions** (no long‑running server).  
Routes are exposed under `/api/*` via a redirect to the single function `api`.

## Local development

```bash
npm i
npm run dev
# Open http://localhost:8888 and try:
#   http://localhost:8888/api/hello
#   http://localhost:8888/api/time
#   POST http://localhost:8888/api/echo  (JSON body)
```

> Requires Node 18+ (Netlify uses Node 18/20).

## Deploying to Netlify

1. Push this folder to a repo (GitHub/GitLab/Bitbucket).
2. In Netlify, **New site from Git**, pick the repo.
3. Keep default build settings (no build step needed).
4. Deploy. Your API will be available at `/api/*`.

### Notes
- The Express app runs **inside a single serverless function** (`netlify/functions/api.js`).
- You **must not** call `app.listen(...)`—the function exports a `handler`.
- If you need more functions, create more files under `netlify/functions/` and add redirects for them.
