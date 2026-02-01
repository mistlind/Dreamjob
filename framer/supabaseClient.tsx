/**
 * Supabase Client Configuration for Framer
 *
 * SETUP INSTRUCTIONS:
 * 1. In Framer, create this file in your Code folder
 * 2. Click the package icon (box) in the code editor toolbar
 * 3. Search for "@supabase/supabase-js" and install it
 * 4. Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY below with your actual credentials
 *    (Get these from Supabase Dashboard > Settings > API)
 */

// IMPORTANT: You must install this package in Framer first!
// Click the package icon in the code editor and search for "@supabase/supabase-js"
import { createClient, SupabaseClient } from "@supabase/supabase-js"

// ⚠️ REQUIRED: Replace these with your Supabase credentials
// Get these from: Supabase Dashboard > Settings > API
const SUPABASE_URL = "YOUR_SUPABASE_URL"        // e.g., "https://abc123.supabase.co"
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY"  // e.g., "eyJhbGc..."

// Create and export the Supabase client
let supabaseInstance: SupabaseClient | null = null

export const getSupabase = (): SupabaseClient => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            realtime: {
                params: {
                    eventsPerSecond: 10,
                },
            },
        })
    }
    return supabaseInstance
}

// Type definitions for our data
export interface DreamJob {
    id: string
    dream_job: string
    country_code: string
    country_name: string
    email: string
    created_at: string
}

export interface DreamJobFeed {
    id: string
    dream_job: string
    country_code: string
    country_name: string
    created_at: string
}

// Helper function to submit a dream job
export const submitDreamJob = async (data: {
    dream_job: string
    country_code: string
    country_name: string
    email: string
}): Promise<{ success: boolean; error?: string; data?: DreamJob }> => {
    try {
        const supabase = getSupabase()
        const { data: result, error } = await supabase
            .from("dream_jobs")
            .insert([data])
            .select()
            .single()

        if (error) {
            return { success: false, error: error.message }
        }

        return { success: true, data: result }
    } catch (err) {
        return { success: false, error: "Failed to submit. Please try again." }
    }
}

// Helper function to get the count of dream jobs
export const getDreamJobsCount = async (): Promise<number> => {
    try {
        const supabase = getSupabase()
        const { count, error } = await supabase
            .from("dream_jobs")
            .select("*", { count: "exact", head: true })

        if (error) {
            console.error("Error fetching count:", error)
            return 0
        }

        return count || 0
    } catch (err) {
        console.error("Failed to get count:", err)
        return 0
    }
}

// Helper function to get dream jobs for the feed
export const getDreamJobsFeed = async (
    limit: number = 50
): Promise<DreamJobFeed[]> => {
    try {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from("dream_jobs")
            .select("id, dream_job, country_code, country_name, created_at")
            .order("created_at", { ascending: false })
            .limit(limit)

        if (error) {
            console.error("Error fetching feed:", error)
            return []
        }

        return data || []
    } catch (err) {
        console.error("Failed to get feed:", err)
        return []
    }
}

// Subscribe to real-time updates
export const subscribeToFeed = (
    onInsert: (job: DreamJobFeed) => void,
    onError?: (error: Error) => void
) => {
    const supabase = getSupabase()

    const channel = supabase
        .channel("dream_jobs_realtime")
        .on(
            "postgres_changes",
            {
                event: "INSERT",
                schema: "public",
                table: "dream_jobs",
            },
            (payload) => {
                const newJob = payload.new as DreamJob
                onInsert({
                    id: newJob.id,
                    dream_job: newJob.dream_job,
                    country_code: newJob.country_code,
                    country_name: newJob.country_name,
                    created_at: newJob.created_at,
                })
            }
        )
        .subscribe((status, err) => {
            if (status === "CHANNEL_ERROR" && onError && err) {
                onError(new Error(err.message))
            }
        })

    // Return unsubscribe function
    return () => {
        supabase.removeChannel(channel)
    }
}
