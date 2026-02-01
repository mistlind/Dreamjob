# CLAUDE.md - AI Assistant Guide for DreamJob

This document provides essential context for AI assistants working with the DreamJob codebase.

## Project Overview

**DreamJob** is a real-time dynamic feed application built with React and Supabase. Users can view and submit answers to various career-related subjects with live real-time updates via WebSocket subscriptions.

### Tech Stack
- **Frontend:** React 18.2 + Vite 5.1
- **Backend:** Supabase (managed PostgreSQL + Realtime API)
- **Real-time:** WebSocket subscriptions via Supabase Realtime
- **Styling:** Custom CSS with CSS variables (dark theme)

## Repository Structure

```
/home/user/Dreamjob/
├── README.md                    # User-facing documentation
├── CLAUDE.md                    # This file - AI assistant guide
├── package.json                 # Root workspace config (proxies to client)
├── .gitignore                   # Git ignore rules
│
├── client/                      # React frontend application
│   ├── src/
│   │   ├── main.jsx            # React app entry point
│   │   ├── App.jsx             # Root component with state & subscriptions
│   │   ├── index.css           # Global styles (CSS variables, dark theme)
│   │   ├── lib/
│   │   │   └── supabase.js     # Supabase client initialization
│   │   └── components/
│   │       ├── Feed.jsx        # Auto-scrolling feed container
│   │       ├── FeedItem.jsx    # Individual answer card (memoized)
│   │       ├── SubjectFilter.jsx # Subject filtering & creation
│   │       └── SubmitAnswer.jsx  # Answer submission form
│   ├── index.html              # HTML entry point
│   ├── vite.config.js          # Vite configuration
│   ├── package.json            # Client dependencies
│   └── .env.example            # Environment variables template
│
└── supabase/
    └── schema.sql              # Database schema & seed data
```

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

Copy `client/.env.example` to `client/.env` and configure:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Note: Variables must be prefixed with `VITE_` to be accessible in browser code.

## Database Schema

### Tables

**subjects**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| name | TEXT | Unique subject name |
| created_at | TIMESTAMPTZ | Creation timestamp |

**answers**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| content | TEXT | Answer text |
| author | TEXT | Author name |
| subject_id | UUID | FK to subjects.id (cascade delete) |
| created_at | TIMESTAMPTZ | Creation timestamp |

### Security
- Row Level Security (RLS) enabled on both tables
- Public read + insert access (no authentication required)
- Both tables configured for Supabase Realtime subscriptions

## Architecture & Data Flow

### Component Hierarchy
```
App.jsx (Root - manages state & subscriptions)
├── SubjectFilter (sidebar - filter & create subjects)
├── SubmitAnswer (sidebar - form to submit answers)
└── Feed (main content - auto-scrolling container)
    └── FeedItem (individual answer cards)
```

### State Management
State is managed in `App.jsx` using React hooks:
- `subjects[]` - All available subjects
- `selectedSubject` - Currently filtered subject (null = all)
- `answers[]` - Current feed answers
- `loading` - Loading state
- `isConnected` - Realtime connection status

### Real-time Flow
```
User Action → Supabase Insert → Database Change Event
                                      ↓
                         Realtime Subscription Triggered
                                      ↓
                         App.jsx receives payload
                                      ↓
                         Fetch full data (with joins)
                                      ↓
                         Update state → Re-render
```

## Key Files & Their Purposes

| File | Purpose |
|------|---------|
| `client/src/App.jsx` | Root component, state management, realtime subscriptions |
| `client/src/lib/supabase.js` | Supabase client initialization with env validation |
| `client/src/components/Feed.jsx` | Auto-scrolling feed with pause-on-hover |
| `client/src/components/FeedItem.jsx` | Memoized answer card component |
| `client/src/components/SubjectFilter.jsx` | Subject list with add-new functionality |
| `client/src/components/SubmitAnswer.jsx` | Form with validation for new answers |
| `client/src/index.css` | CSS variables, dark theme, responsive layout |
| `supabase/schema.sql` | Complete database schema with RLS policies |

## Code Conventions

### React Patterns
- Functional components with hooks (no class components)
- `React.memo()` for expensive list items (see `FeedItem.jsx`)
- `useRef` and `useCallback` for animations and performance
- Props destructuring in function parameters

### Styling
- CSS variables defined in `:root` for theming
- BEM-like class naming (e.g., `.feed-item`, `.feed-item-header`)
- Mobile-first responsive design (breakpoint at 900px)
- Dark theme with slate/indigo color scheme

### File Naming
- React components: PascalCase (e.g., `FeedItem.jsx`)
- Utility files: camelCase (e.g., `supabase.js`)
- CSS: kebab-case classes

### State Updates
- Always use functional updates when new state depends on previous:
  ```jsx
  setAnswers(prev => [newAnswer, ...prev])
  ```

## Common Tasks

### Adding a New Component
1. Create file in `client/src/components/` using PascalCase
2. Export as default
3. Import and use in parent component
4. Add styles to `index.css` if needed

### Modifying Database Schema
1. Update `supabase/schema.sql`
2. Run migration in Supabase Dashboard or CLI
3. Update affected components

### Adding a New Realtime Subscription
1. In `App.jsx`, add to the subscription setup in `useEffect`
2. Use `supabase.channel()` API
3. Handle connection status updates
4. Clean up subscription in useEffect return

## Performance Considerations

- `FeedItem` uses `React.memo()` to prevent unnecessary re-renders
- Feed scrolling uses `requestAnimationFrame` for smooth 30px/sec animation
- Subscriptions filter by `subject_id` when a subject is selected
- Indexes exist on `subject_id` and `created_at DESC` for query performance

## Testing

No test framework is currently configured. When adding tests:
- Vitest is recommended (integrates well with Vite)
- React Testing Library for component tests
- Mock Supabase client for unit tests

## Deployment

The app builds to static files in `client/dist/`:
- Compatible with Vercel, Netlify, GitHub Pages, AWS S3+CloudFront
- Requires Supabase project with configured environment variables
- Node.js 18+ required for build process

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
- Ensure `.env` file exists in `client/` directory
- Variables must be prefixed with `VITE_`
- Restart dev server after changing env vars

**Realtime not updating**
- Check connection status indicator in header
- Verify Supabase Realtime is enabled for tables
- Check browser console for WebSocket errors

**Build fails**
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js 18+ is installed

## Git Workflow

- Main development happens on feature branches
- Commit messages should be descriptive
- The codebase was recently refactored from custom WebSockets to Supabase Realtime
