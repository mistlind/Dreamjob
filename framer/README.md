# Dream Job Form - Framer + Supabase Integration

A complete solution for collecting dream job submissions in Framer with real-time Supabase integration.

## Features

- **Dream Job Form**: Collect dream job, country (with flags), and email
- **Live Feed**: Auto-scrolling feed showing submissions with timestamps
- **Live Counter**: Real-time count of total submissions
- **Country Flags**: 195 countries with emoji flags
- **Real-time Updates**: Instant updates via Supabase Realtime

## Quick Start

### Step 1: Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project (wait for it to finish setting up)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query** and paste the contents of `supabase/dream_jobs_schema.sql`
5. Click **Run** to create the table
6. Get your credentials from **Settings > API**:
   - Copy the `Project URL` (e.g., `https://xxxxx.supabase.co`)
   - Copy the `anon public` key (starts with `eyJ...`)

### Step 2: Add Code Files to Framer (IN THIS ORDER)

**Important**: Add files in this specific order to avoid import errors.

1. Open your Framer project
2. Go to **Assets** panel (left sidebar) > **Code** tab
3. Create files in this order:

**File 1: `countries.tsx`**
- Click **+** > **New Code File**
- Name it exactly: `countries.tsx`
- Copy/paste the entire contents from `framer/countries.tsx`

**File 2: `supabaseClient.tsx`**
- Click **+** > **New Code File**
- Name it exactly: `supabaseClient.tsx`
- Copy/paste the entire contents from `framer/supabaseClient.tsx`

**File 3: Install the Supabase package**
- With `supabaseClient.tsx` open, click the **package icon** (📦) in the code editor toolbar
- Search for `@supabase/supabase-js`
- Click **Install**

**File 4: Configure your credentials**
- In `supabaseClient.tsx`, find these lines near the top:
```typescript
const SUPABASE_URL = "YOUR_SUPABASE_URL"
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"
```
- Replace with your actual values from Step 1

**File 5: `DreamJobForm.tsx`**
- Click **+** > **New Code File**
- Name it exactly: `DreamJobForm.tsx`
- Copy/paste from `framer/DreamJobForm.tsx`

**File 6: `DreamJobFeed.tsx`** (optional)
- Same process with `framer/DreamJobFeed.tsx`

**File 7: `DreamJobCounter.tsx`** (optional)
- Same process with `framer/DreamJobCounter.tsx`

### Step 3: Use the Components

After adding the files correctly:

1. Go to **Assets** panel > **Components** tab
2. You should see: **DreamJobForm**, **DreamJobFeed**, **DreamJobCounter**
3. Drag them onto your canvas
4. Customize using the properties panel on the right

### Troubleshooting: Components Not Showing

If components don't appear in the Components tab:

1. **Check for errors**: Open each code file and look for red underlines
2. **Package not installed**: Make sure you installed `@supabase/supabase-js` (see Step 2, File 3)
3. **File naming**: File names must match exactly (case-sensitive)
4. **Import paths**: Imports should be `./countries` and `./supabaseClient` (lowercase)
5. **Refresh**: Close and reopen the code files, or refresh the Framer browser tab

## Supabase Schema

Run this SQL in your Supabase SQL Editor:

```sql
-- Create the dream_jobs table
CREATE TABLE IF NOT EXISTS dream_jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dream_job TEXT NOT NULL,
    country_code CHAR(2) NOT NULL,
    country_name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE dream_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON dream_jobs
    FOR SELECT TO anon, authenticated USING (true);

-- Allow public insert access
CREATE POLICY "Allow public insert access" ON dream_jobs
    FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE dream_jobs;
```

## Components Reference

### DreamJobForm

A complete form component with:
- Dream job text input
- Country dropdown with flags
- Email input with validation
- Submit button with loading state
- Success/error messages

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| backgroundColor | Color | Form background color |
| textColor | Color | Text color |
| accentColor | Color | Accent/highlight color |
| borderRadius | Number | Corner radius |
| padding | Number | Internal padding |
| fontSize | Number | Base font size |
| dreamJobLabel | String | Label for dream job field |
| dreamJobPlaceholder | String | Placeholder text |
| countryLabel | String | Label for country field |
| emailLabel | String | Label for email field |
| submitButtonText | String | Button text |
| successMessage | String | Success message |

### DreamJobFeed

Live feed displaying submissions with:
- Auto-scrolling animation
- Country flags
- Relative timestamps
- Real-time updates

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| maxItems | Number | Maximum items to display |
| showCountryFlag | Boolean | Show/hide country flags |
| showTimestamp | Boolean | Show/hide timestamps |
| autoScroll | Boolean | Enable auto-scrolling |
| scrollSpeed | Number | Scroll speed (px/sec) |
| pauseOnHover | Boolean | Pause scroll on hover |
| cardBackgroundColor | Color | Card background |
| cardBorderRadius | Number | Card corner radius |
| gap | Number | Space between cards |

### DreamJobCounter

Animated counter showing total entries:

**Properties:**
| Property | Type | Description |
|----------|------|-------------|
| prefix | String | Text before number |
| suffix | String | Text after number |
| showAnimation | Boolean | Animate number changes |
| animationDuration | Number | Animation duration |
| formatNumber | Boolean | Add commas (1,234) |
| fontSize | Number | Number font size |
| fontWeight | Number | Number font weight |
| textAlign | Enum | left/center/right |

## Using Code Overrides

If you prefer to design your own form elements in Framer, use the code overrides:

1. Create a file with your overrides (copy from `overrides.tsx`)
2. Design your form elements in Framer
3. Apply overrides to each element:
   - `DreamJobInput` → Dream job text input
   - `CountrySelect` → Country dropdown
   - `EmailInput` → Email text input
   - `SubmitButton` → Submit button
   - `FormMessage` → Message text element
   - `LiveCounter` → Counter text element

## Data Structure

Each submission stores:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier |
| dream_job | Text | The dream job description |
| country_code | Char(2) | ISO country code (e.g., "US") |
| country_name | Text | Full country name |
| email | Text | User's email address |
| created_at | Timestamp | Submission time |

## Countries List

The integration includes 195 countries with emoji flags. Countries are sorted alphabetically by name.

Example usage in code:
```typescript
import { countries, getCountryByCode } from "./countries"

// Get all countries
countries.forEach(c => console.log(c.flag, c.name))

// Get specific country
const usa = getCountryByCode("US")
// { code: "US", name: "United States", flag: "🇺🇸" }
```

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure RLS policies are in place

### Real-time not working
- Confirm `ALTER PUBLICATION supabase_realtime ADD TABLE dream_jobs;` was run
- Check that Realtime is enabled in Supabase dashboard

### Flags not showing
- Emoji flags require modern browser support
- Some older systems may show letter codes instead

## Security Notes

- The `anon` key is safe to expose in client-side code
- Email addresses are stored but not displayed in the feed
- RLS policies restrict access to read/insert only
- Consider adding rate limiting for production use

## Support

For issues with:
- **Framer**: [Framer Community](https://www.framer.community/)
- **Supabase**: [Supabase Discord](https://discord.supabase.com/)
