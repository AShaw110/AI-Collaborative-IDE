# CollabCode

Real-time collaborative code editor built on the MERN stack (MongoDB, Express, React, Node.js) with Socket.io synchronization, remote sandboxed execution via Piston, and AI debugging via Google Gemini.

## Architecture

### Backend (`server/`)

The Express backend follows a three-layer separation:

```
Routes (HTTP mapping) -> Controllers (validation & orchestration) -> Services (external APIs)
```

- **Routes** (`src/routes/`) declare endpoint paths and HTTP verbs without business logic.
- **Controllers** (`src/controllers/`) validate payloads, enforce HTTP status codes (`200`, `201`, `400`, `404`, `500`, `502`), and delegate I/O.
- **Services** (`src/services/`) encapsulate external integrations (`pistonService.js` for Piston v2, `aiService.js` for `@google/genai`).
- **Real-time Sync** (`src/socket/socketHandler.js`) shares the HTTP server port via `http.createServer(app)` and broadcasts room-scoped updates with `socket.to(roomId)` so the sender does not receive echoed changes.
- **Persistence** (`src/models/Room.js`) stores `{ roomId, language, codeContent }` with a unique index on `roomId` and Mongoose timestamps.

### Frontend (`client/`)

- **Routing**: `react-router-dom` routes `/` (`LandingPage`) and `/editor/:roomId` (`EditorPage`).
- **Editor**: `@monaco-editor/react` configured for JavaScript, C++, and Python.
- **Synchronization**: `useSocket` manages Socket.io lifecycle and uses an `isRemoteUpdate` ref to prevent infinite broadcast loops when applying incoming `code-update` events.
- **Auto-save**: `useDebounce` coalesces keystrokes (500ms) before issuing `PUT /api/rooms/:roomId`, skipping redundant writes when the snapshot matches the last persisted state.
- **Accessibility**: Semantic landmarks (`<main>`, `<nav>`, `<section>`, `<aside>`), skip-to-content link, `aria-live` status/output regions, `:focus-visible` outlines, and a portal-based `Modal` with focus trapping and restoration.

## Prerequisites

- Node.js >= 18
- MongoDB running locally or via MongoDB Atlas
- Google Gemini API key

## Local Setup

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Update `server/.env` with your `MONGODB_URI` and `GEMINI_API_KEY`. The server listens on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` and proxies `/api` and `/socket.io` requests to `http://localhost:5000`.

## Environment Variables (`server/.env`)

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | HTTP/WebSocket server port |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/collab-editor` | MongoDB connection string |
| `GEMINI_API_KEY` | For `/api/debug` | — | Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-3.8-flash` | Gemini model identifier |
| `CLIENT_ORIGIN` | No | `http://localhost:5173` | Allowed CORS origin |

## REST API

### `GET /api/rooms/:roomId`
Retrieves an existing room (`200`) or creates one with default JavaScript starter content (`201`).

### `PUT /api/rooms/:roomId`
Updates `codeContent` and/or `language` for an existing room (`200`), or returns `404` if the room does not exist.

### `POST /api/execute`
Request body: `{ "code": string, "language": "javascript" | "cpp" | "python", "stdin"?: string }`

Executes the code against the Piston v2 API and returns `{ success: true, data: { stdout, stderr, exitCode, compileOutput } }`. Returns `400` for invalid input or unsupported languages, and `502` on upstream failures.

### `POST /api/debug`
Request body: `{ "code": string, "language": string }`

Queries the Gemini API and returns `{ success: true, hints }`. Returns `400` for invalid input, `500` if `GEMINI_API_KEY` is unconfigured, and `502` on upstream AI errors.

### `GET /health`
Returns server health status and uptime.

## Socket.io Events

| Event | Direction | Payload | Description |
| --- | --- | --- | --- |
| `join-room` | Client -> Server | `{ roomId }` | Joins a room channel |
| `room-joined` | Server -> Client | `{ roomId, socketId, timestamp }` | Confirms room membership |
| `code-change` | Client -> Server | `{ roomId, code }` | Submits local editor buffer |
| `code-update` | Server -> Client | `{ code, senderId, timestamp }` | Broadcasts buffer to other peers |
| `language-change` | Client -> Server | `{ roomId, language }` | Submits language selection |
| `language-update` | Server -> Client | `{ language, senderId }` | Broadcasts language to other peers |

## Project Structure

```text
collaborative-code-editor/
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── CodeEditor.jsx
│       │   ├── DebugPanel.jsx
│       │   ├── EditorPage.jsx
│       │   ├── LandingPage.jsx
│       │   ├── Modal.jsx
│       │   ├── OutputPanel.jsx
│       │   └── Toolbar.jsx
│       ├── hooks/
│       │   ├── useDebounce.js
│       │   └── useSocket.js
│       ├── services/
│       │   └── api.js
│       └── styles/
│           └── index.css
└── server/
    ├── .env.example
    ├── package.json
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        │   └── db.js
        ├── controllers/
        │   ├── debugController.js
        │   ├── executeController.js
        │   └── roomController.js
        ├── models/
        │   └── Room.js
        ├── routes/
        │   ├── debugRoutes.js
        │   ├── executeRoutes.js
        │   └── roomRoutes.js
        ├── services/
        │   ├── aiService.js
        │   └── pistonService.js
        └── socket/
            └── socketHandler.js
```
