# DreamJob - Dynamic Feed Application

A real-time scrolling feed application built with React, Node.js/Express, Socket.io, and PostgreSQL.

## Features

- **Real-time updates**: New answers appear instantly via WebSockets
- **Subject filtering**: Filter the feed by different subjects
- **Auto-scrolling feed**: Content scrolls automatically
- **Pause on hover**: Feed pauses when you hover over it
- **User submissions**: Anyone can submit answers to subjects
- **Live connection indicator**: Shows connection status

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Node.js + Express
- **Real-time**: Socket.io
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: CSS with custom properties

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Setup

### 1. Clone and Install Dependencies

```bash
# Install all dependencies (root, server, and client)
npm run install:all
```

### 2. Configure Database

Create a `.env` file in the `server` directory:

```bash
cd server
cp .env.example .env
```

Edit `.env` with your PostgreSQL connection string:

```
DATABASE_URL="postgresql://user:password@localhost:5432/dreamjob?schema=public"
PORT=3001
```

### 3. Initialize Database

```bash
cd server
npm run db:generate  # Generate Prisma client
npm run db:push      # Create database tables
```

### 4. Run the Application

```bash
# From root directory - runs both server and client
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Server
cd server && npm run dev

# Terminal 2 - Client
cd client && npm run dev
```

### 5. Open the Application

Visit `http://localhost:5173` in your browser.

## Project Structure

```
dreamjob/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Feed.jsx           # Scrolling feed with pause
│   │   │   ├── FeedItem.jsx       # Individual answer card
│   │   │   ├── SubjectFilter.jsx  # Subject filter sidebar
│   │   │   └── SubmitAnswer.jsx   # Answer submission form
│   │   ├── hooks/
│   │   │   └── useSocket.js       # Socket.io hooks
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   └── index.js        # Express + Socket.io server
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
└── package.json            # Root package.json
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subjects` | Get all subjects |
| POST | `/api/subjects` | Create a new subject |
| GET | `/api/subjects/:id/answers` | Get answers for a subject |
| POST | `/api/answers` | Submit a new answer |
| GET | `/api/health` | Health check |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `subject:join` | Client → Server | Join a subject room |
| `answer:created` | Server → Client | New answer broadcast |
| `subject:created` | Server → Client | New subject broadcast |

## Configuration

### Environment Variables

**Server (.env)**:
- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3001)
- `CLIENT_URL` - Client URL for CORS (default: http://localhost:5173)

**Client (.env)**:
- `VITE_API_URL` - API URL (uses proxy in development)
- `VITE_SOCKET_URL` - Socket.io server URL

## Development

### Database Management

```bash
# View database in browser
cd server && npm run db:studio

# Reset database
cd server && npx prisma db push --force-reset
```

### Building for Production

```bash
npm run build
```
