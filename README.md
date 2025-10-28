# Wedding App Backend (Netlify Functions + Express + MySQL)

Endpoints:
- `POST /api/auth/login` → `{ token, user }`
- `GET /api/health`
- Public: `GET /api/guests/by-code/:code`
- Protected (Bearer token):
  - `GET /api/guests`
  - `POST /api/guests`
  - `PUT /api/guests/:id`
  - `DELETE /api/guests/:id`

## Local
```
cp .env.example .env
npm i
npx netlify-cli dev
# Visit http://localhost:8888/api/health
```
or run Express directly:
```
npm run start
# http://localhost:4000/api/health
```

## DB
```
mysql -u root -p < schema.sql
mysql -u root -p < seed.sql
```
Seeded users: `admin`, `staff` with password `password123`.
