# ShadowNote Backend

Backend service for ShadowNote. Provides HTTP APIs, WebSocket realtime feed, and Telegram bot integrations.

**Highlights**
- Express API + WebSocket gateway
- MongoDB persistence
- Rate limiting for anonymous submissions
- Telegram bot + admin notify flows
- Static web assets served from `/game`

**Tech Stack**
- Node.js, Express, WebSocket (`ws`)
- MongoDB + Mongoose
- Telegram Bot API

**Requirements**
- Node.js 18+
- MongoDB

**Quick Start**
```bash
npm install
cp .env.example .env
npm start
```

**Scripts**
- `npm start` starts the server

**Environment**
Create `.env` from `.env.example`.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | MongoDB connection string |
| `TELEGRAM_BOT_TOKEN` | Public bot token |
| `TELEGRAM_NOTIFY_TOKEN` | Admin notify bot token |
| `PUBLIC_URL` | Public app URL used in bot messages |
| `DEV` | `true` enables dev mode |
| `NGROK_AUTHTOKEN` | ngrok auth token for dev tunnel |
| `NGROK_DOMAIN` | ngrok domain for dev tunnel |
| `PORT` | Production HTTP port |
| `DEV_PORT` | Dev HTTP port |

**Endpoints**
- WebSocket endpoint: `/websocket`
- Static assets: `/game`

**WebSocket Protocol**
Client sends JSON messages. Server responds with JSON messages.

Login:
```json
{ "type": "login", "fingerprint": "<device-id>" }
```
Response:
```json
{ "code": 200 }
```

Ping (fetch feed):
```json
{ "type": "ping" }
```
Response:
```json
{ "code": 201, "comments": [], "popular": [], "onlines": 0 }
```

Send post:
```json
{ "type": "send", "content": "<text>" }
```
Response:
```json
{ "code": 999, "type": "success", "message": "İtiraf Yayınlandı!" }
```

Like:
```json
{ "type": "like", "id": "<comment-id>" }
```

Dislike:
```json
{ "type": "dislike", "id": "<comment-id>" }
```

**Validation Rules**
- Rate limit: 3 posts per minute per IP
- Length: 20 to 700 characters

**Data Models**
- `comments`: `id`, `type`, `fingerprint`, `content`, `ip`, `likes`, `dislikes`, `views`, `date`
- `votes`: `id`, `comment`, `fingerprint`, `ip`, `type`, `date`

**Structure**
- `src/index.js` server entry
- `src/config.js` env config
- `src/modules/websocket.js` realtime logic
- `src/functions` bot and helpers
- `src/databases` mongoose models

**Notes**
- In dev mode, ngrok tunnel is optional and only starts if `NGROK_AUTHTOKEN` and `NGROK_DOMAIN` are set.

**License**
MIT
