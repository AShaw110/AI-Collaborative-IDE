# Collaborative Code Editor

A real-time collaborative cloud IDE built on the MERN stack (MongoDB, Express, React, Node.js). It features WebSocket-based synchronization, remote code execution, and AI-powered debugging.

## Core Features

* **Live Collaboration:** Real-time keystroke synchronization using Socket.io, with sessions isolated into unique rooms.
* **Multi-Language Support:** Native syntax highlighting and live code execution for C++, Python, and JavaScript via the Monaco Editor and Piston API.
* **AI Debugger:** Integrated Google Gemini API to analyze code snippets and generate debugging hints.
* **Optimized Persistence:** 500ms debounced auto-saves to MongoDB to minimize database write operations during active typing.

## Tech Stack

* **Frontend:** React.js, Tailwind CSS, Monaco Editor
* **Backend:** Node.js, Express.js, Socket.io
* **Database:** MongoDB (Mongoose)
* **External APIs:** Piston v2 (Code Execution), Google Gemini (AI Debugging)

## Local Setup

### Prerequisites
* Node.js (v18+)
* MongoDB (Local instance or Atlas URI)
* Google Gemini API Key

### 1. Start the Backend

Open a terminal and navigate to the server directory:

    cd server
    cp .env.example .env
    npm install
    npm run dev

Note: Add your MONGODB_URI and GEMINI_API_KEY to the newly created server/.env file. The server runs on port 5000.

### 2. Start the Frontend

Open a second terminal and navigate to the client directory:

    cd client
    npm install
    npm run dev

The React app runs on port 5173 and automatically proxies API requests to the backend.

## Environment Variables (server/.env)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| PORT | No | 5000 | Backend HTTP/WebSocket server port |
| MONGODB_URI | Yes | mongodb://localhost:27017/collab-editor | MongoDB connection string |
| GEMINI_API_KEY | Yes | — | Required for the AI debugging feature |
| GEMINI_MODEL | No | gemini-3.8-flash | Specific Gemini model identifier |

## System Architecture

The Express backend separates routing, business logic, and external services for maintainability.

* **REST API:** Manages 4 core endpoints for room state, remote compilation (/api/execute), and AI hints (/api/debug).
* **WebSockets:** Uses join-room, code-update, and language-update events to broadcast changes. Implements a client-side reference guard to prevent WebSocket broadcast echo loops when multiple users type simultaneously.
* **Database Schema:** Stores room state (roomId, language, codeContent) with a unique index on roomId to handle concurrent connections safely.
