# DreamJob - Dynamic Feed Application

A real-time scrolling feed application built with React and Supabase.

## Features

- **Real-time updates**: New answers appear instantly via Supabase Realtime
- **Subject filtering**: Filter the feed by different subjects
- **Auto-scrolling feed**: Content scrolls automatically
- **Pause on hover**: Feed pauses when you hover over it
- **User submissions**: Anyone can submit answers to subjects
- **Live connection indicator**: Shows connection status

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL + Realtime + API)
- **Styling**: CSS with custom properties

## Prerequisites

- Node.js 18+
- Supabase account (free tier works)

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Set Up Database

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of `supabase/schema.sql`
3. Click "Run" to create tables and sample data

### 3. Enable Realtime

1. Go to Database > Replication in Supabase Dashboard
2. Enable replication for both `subjects` and `answers` tables

### 4. Configure Environment

Create a `.env` file in the `client` directory:

```bash
cd client
cp .env.example .env
```

Add your Supabase credentials (find these in Project Settings > API):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 6. Open the Application

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
│   │   ├── lib/
│   │   │   └── supabase.js        # Supabase client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── supabase/
│   └── schema.sql          # Database schema
└── package.json
```

## How It Works

### Real-time Subscriptions

The app uses Supabase Realtime to subscribe to database changes:

```javascript
supabase
  .channel('answers-channel')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'answers',
  }, (payload) => {
    // New answer received - update UI
  })
  .subscribe();
```

### Subject Filtering

When you select a subject, the subscription is updated to only receive answers for that subject:

```javascript
filter: `subject_id=eq.${selectedSubject}`
```

## Database Schema

### subjects
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Subject name (unique) |
| created_at | TIMESTAMPTZ | Creation timestamp |

### answers
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| content | TEXT | Answer content |
| author | TEXT | Author name |
| subject_id | UUID | Foreign key to subjects |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Building for Production

```bash
npm run build
```

The built files will be in `client/dist/`. Deploy to any static hosting service (Vercel, Netlify, etc.).

## Why Supabase?

- **Zero backend code**: No server to maintain
- **Built-in realtime**: WebSocket subscriptions out of the box
- **PostgreSQL**: Full SQL power with a managed database
- **Free tier**: Generous limits for development and small projects
- **Row Level Security**: Fine-grained access control
