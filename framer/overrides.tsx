/**
 * Framer Code Overrides for Dream Job Form Integration
 *
 * Use these overrides to connect your existing Framer-designed form elements
 * to the Supabase backend. This is an alternative to using the code components.
 *
 * USAGE:
 * 1. Design your form in Framer with your own styling
 * 2. Add these overrides to your form elements:
 *    - DreamJobInput: Apply to your dream job text input
 *    - CountrySelect: Apply to your country dropdown/select
 *    - EmailInput: Apply to your email text input
 *    - SubmitButton: Apply to your submit button
 *    - FormMessage: Apply to a text element to show success/error messages
 *    - LiveCounter: Apply to a text element to show the total count
 *    - FeedContainer: Apply to a stack/frame to display the feed
 */

import { ComponentType, useState, useEffect, createContext, useContext } from "react"
import { Override } from "framer"
import { submitDreamJob, getDreamJobsCount, getDreamJobsFeed, subscribeToFeed, DreamJobFeed } from "./supabaseClient"
import { countriesSorted, getCountryByCode, Country } from "./countries"

// ============================================
// SHARED STATE CONTEXT
// ============================================

// Create a simple state store for form data
interface FormState {
    dreamJob: string
    selectedCountry: Country | null
    email: string
    isSubmitting: boolean
    message: { type: "success" | "error"; text: string } | null
    count: number
    feedItems: DreamJobFeed[]
}

// Global state (persists across component renders)
let globalState: FormState = {
    dreamJob: "",
    selectedCountry: null,
    email: "",
    isSubmitting: false,
    message: null,
    count: 0,
    feedItems: [],
}

// Subscribers for state changes
const subscribers: Set<() => void> = new Set()

const updateState = (updates: Partial<FormState>) => {
    globalState = { ...globalState, ...updates }
    subscribers.forEach((cb) => cb())
}

const useGlobalState = (): [FormState, (updates: Partial<FormState>) => void] => {
    const [, setTick] = useState(0)

    useEffect(() => {
        const callback = () => setTick((t) => t + 1)
        subscribers.add(callback)
        return () => {
            subscribers.delete(callback)
        }
    }, [])

    return [globalState, updateState]
}

// Initialize real-time subscriptions once
let initialized = false
const initializeRealtime = () => {
    if (initialized) return
    initialized = true

    // Fetch initial data
    getDreamJobsCount().then((count) => updateState({ count }))
    getDreamJobsFeed().then((items) => updateState({ feedItems: items }))

    // Subscribe to real-time updates
    subscribeToFeed(
        (newJob) => {
            updateState({
                count: globalState.count + 1,
                feedItems: [newJob, ...globalState.feedItems].slice(0, 50),
            })
        },
        (error) => console.error("Subscription error:", error)
    )
}

// ============================================
// FORM INPUT OVERRIDES
// ============================================

/**
 * Override for Dream Job text input
 * Apply this to your text input field for the dream job
 */
export const DreamJobInput: Override = () => {
    const [state, setState] = useGlobalState()

    return {
        value: state.dreamJob,
        onChange: (value: string) => setState({ dreamJob: value }),
        disabled: state.isSubmitting,
        placeholder: "e.g., Astronaut, Chef, Game Designer...",
    }
}

/**
 * Override for Country select/dropdown
 * Apply this to your select element for country
 *
 * Note: For Framer's native dropdown, you may need to handle this differently
 * This works with standard HTML select elements
 */
export const CountrySelect: Override = () => {
    const [state, setState] = useGlobalState()

    return {
        value: state.selectedCountry?.code || "",
        onChange: (e: React.ChangeEvent<HTMLSelectElement> | string) => {
            const code = typeof e === "string" ? e : e.target.value
            const country = countriesSorted.find((c) => c.code === code)
            setState({ selectedCountry: country || null })
        },
        disabled: state.isSubmitting,
        // Provide options for rendering
        options: countriesSorted.map((c) => ({
            value: c.code,
            label: `${c.flag} ${c.name}`,
        })),
    }
}

/**
 * Override for Email text input
 * Apply this to your text input field for email
 */
export const EmailInput: Override = () => {
    const [state, setState] = useGlobalState()

    return {
        value: state.email,
        onChange: (value: string) => setState({ email: value }),
        disabled: state.isSubmitting,
        placeholder: "your@email.com",
        type: "email",
    }
}

/**
 * Override for Submit Button
 * Apply this to your form submit button
 */
export const SubmitButton: Override = () => {
    const [state, setState] = useGlobalState()

    const isValidEmail = (email: string): boolean => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const isFormValid =
        state.dreamJob.trim().length > 0 &&
        state.selectedCountry !== null &&
        isValidEmail(state.email)

    const handleSubmit = async () => {
        if (!isFormValid || state.isSubmitting) return

        setState({ isSubmitting: true, message: null })

        try {
            const result = await submitDreamJob({
                dream_job: state.dreamJob.trim(),
                country_code: state.selectedCountry!.code,
                country_name: state.selectedCountry!.name,
                email: state.email.trim(),
            })

            if (result.success) {
                setState({
                    message: { type: "success", text: "Thanks for sharing your dream!" },
                    dreamJob: "",
                    selectedCountry: null,
                    email: "",
                    isSubmitting: false,
                })
                // Clear message after 5 seconds
                setTimeout(() => setState({ message: null }), 5000)
            } else {
                setState({
                    message: { type: "error", text: result.error || "Something went wrong" },
                    isSubmitting: false,
                })
            }
        } catch (err) {
            setState({
                message: { type: "error", text: "Failed to submit. Please try again." },
                isSubmitting: false,
            })
        }
    }

    return {
        onClick: handleSubmit,
        onTap: handleSubmit,
        disabled: !isFormValid || state.isSubmitting,
        style: {
            opacity: isFormValid && !state.isSubmitting ? 1 : 0.5,
            cursor: isFormValid && !state.isSubmitting ? "pointer" : "not-allowed",
        },
        // For text content inside button
        children: state.isSubmitting ? "Submitting..." : undefined,
    }
}

/**
 * Override for Form Message display
 * Apply this to a text element to show success/error messages
 */
export const FormMessage: Override = () => {
    const [state] = useGlobalState()

    if (!state.message) {
        return {
            style: { display: "none" },
        }
    }

    return {
        style: {
            display: "block",
            color: state.message.type === "success" ? "#16a34a" : "#dc2626",
        },
        children: state.message.text,
    }
}

// ============================================
// COUNTER OVERRIDES
// ============================================

/**
 * Override for Live Counter display
 * Apply this to a text element to show the total count
 */
export const LiveCounter: Override = () => {
    const [state] = useGlobalState()

    // Initialize real-time on first use
    useEffect(() => {
        initializeRealtime()
    }, [])

    const formattedCount = state.count.toLocaleString()

    return {
        children: formattedCount,
    }
}

/**
 * Override for Counter with label
 * Shows count with suffix text
 */
export const LiveCounterWithLabel: Override = () => {
    const [state] = useGlobalState()

    useEffect(() => {
        initializeRealtime()
    }, [])

    return {
        children: `${state.count.toLocaleString()} dreamers worldwide`,
    }
}

// ============================================
// FEED OVERRIDES
// ============================================

/**
 * Override for Feed Container
 * Apply this to a Stack or Frame to populate it with feed items
 *
 * Note: This override provides feed data. You'll need to handle
 * the rendering of items in your Framer design.
 */
export const FeedData: Override = () => {
    const [state] = useGlobalState()

    useEffect(() => {
        initializeRealtime()
    }, [])

    // This provides the feed items as a prop
    // Use with a code component that can render the items
    return {
        feedItems: state.feedItems,
        children: state.feedItems.map((item) => {
            const country = getCountryByCode(item.country_code)
            return {
                id: item.id,
                dreamJob: item.dream_job,
                countryFlag: country?.flag || "",
                countryName: country?.name || item.country_name,
                timestamp: item.created_at,
            }
        }),
    }
}

// ============================================
// COUNTRY OPTIONS DATA
// ============================================

/**
 * Get countries list for use in custom dropdown components
 * This is a utility function, not an override
 */
export const getCountries = () => {
    return countriesSorted.map((c) => ({
        value: c.code,
        label: `${c.flag} ${c.name}`,
        flag: c.flag,
        name: c.name,
    }))
}

// Export countries for direct use
export { countriesSorted as countries }
