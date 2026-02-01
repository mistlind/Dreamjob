/**
 * Dream Job Form Component for Framer
 *
 * A complete form component that submits dream job entries to Supabase.
 * Features:
 * - Dream job text input
 * - Country select with emoji flags
 * - Email input with validation
 * - Success/error feedback
 * - Fully customizable styling via props
 *
 * USAGE:
 * 1. Copy this file to your Framer project's code folder
 * 2. The component will appear in your Components panel
 * 3. Drag it onto your canvas and configure via the properties panel
 */

import { addPropertyControls, ControlType } from "framer"
import { useState, useCallback, CSSProperties } from "react"
import { countriesSorted, Country } from "./countries"
import { submitDreamJob } from "./supabaseClient"

// Props interface
interface DreamJobFormProps {
    // Styling
    backgroundColor: string
    textColor: string
    accentColor: string
    borderRadius: number
    padding: number
    fontFamily: string
    fontSize: number
    inputBackgroundColor: string
    inputBorderColor: string
    buttonBackgroundColor: string
    buttonTextColor: string
    buttonHoverColor: string
    // Labels
    dreamJobLabel: string
    dreamJobPlaceholder: string
    countryLabel: string
    countryPlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    submitButtonText: string
    submittingText: string
    successMessage: string
    // Callbacks
    onSubmitSuccess?: () => void
    onSubmitError?: (error: string) => void
}

// Default props
const defaultProps: DreamJobFormProps = {
    backgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    accentColor: "#6366f1",
    borderRadius: 12,
    padding: 24,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 16,
    inputBackgroundColor: "#f8fafc",
    inputBorderColor: "#e2e8f0",
    buttonBackgroundColor: "#6366f1",
    buttonTextColor: "#ffffff",
    buttonHoverColor: "#4f46e5",
    dreamJobLabel: "What's your dream job?",
    dreamJobPlaceholder: "e.g., Astronaut, Chef, Game Designer...",
    countryLabel: "Country",
    countryPlaceholder: "Select your country",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    submitButtonText: "Share My Dream",
    submittingText: "Submitting...",
    successMessage: "Thanks for sharing your dream!",
}

export default function DreamJobForm(props: DreamJobFormProps) {
    const p = { ...defaultProps, ...props }

    // Form state
    const [dreamJob, setDreamJob] = useState("")
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [message, setMessage] = useState<{
        type: "success" | "error"
        text: string
    } | null>(null)

    // Validation
    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const isFormValid =
        dreamJob.trim().length > 0 &&
        selectedCountry !== null &&
        isValidEmail(email)

    // Handle submit
    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()

            if (!isFormValid || isSubmitting) return

            setIsSubmitting(true)
            setMessage(null)

            try {
                const result = await submitDreamJob({
                    dream_job: dreamJob.trim(),
                    country_code: selectedCountry!.code,
                    country_name: selectedCountry!.name,
                    email: email.trim(),
                })

                if (result.success) {
                    setMessage({ type: "success", text: p.successMessage })
                    // Reset form
                    setDreamJob("")
                    setSelectedCountry(null)
                    setEmail("")
                    // Callback
                    p.onSubmitSuccess?.()
                    // Clear message after 5 seconds
                    setTimeout(() => setMessage(null), 5000)
                } else {
                    setMessage({
                        type: "error",
                        text: result.error || "Something went wrong",
                    })
                    p.onSubmitError?.(result.error || "Unknown error")
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to submit"
                setMessage({ type: "error", text: errorMessage })
                p.onSubmitError?.(errorMessage)
            } finally {
                setIsSubmitting(false)
            }
        },
        [
            dreamJob,
            selectedCountry,
            email,
            isFormValid,
            isSubmitting,
            p.successMessage,
            p.onSubmitSuccess,
            p.onSubmitError,
        ]
    )

    // Styles
    const containerStyle: CSSProperties = {
        backgroundColor: p.backgroundColor,
        borderRadius: p.borderRadius,
        padding: p.padding,
        fontFamily: p.fontFamily,
        fontSize: p.fontSize,
        color: p.textColor,
        width: "100%",
        boxSizing: "border-box",
    }

    const labelStyle: CSSProperties = {
        display: "block",
        marginBottom: 8,
        fontWeight: 600,
        fontSize: p.fontSize * 0.875,
    }

    const inputStyle: CSSProperties = {
        width: "100%",
        padding: "12px 16px",
        fontSize: p.fontSize,
        fontFamily: p.fontFamily,
        backgroundColor: p.inputBackgroundColor,
        border: `1px solid ${p.inputBorderColor}`,
        borderRadius: p.borderRadius * 0.67,
        color: p.textColor,
        boxSizing: "border-box",
        outline: "none",
        transition: "border-color 0.2s ease",
    }

    const selectStyle: CSSProperties = {
        ...inputStyle,
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 40,
    }

    const buttonStyle: CSSProperties = {
        width: "100%",
        padding: "14px 24px",
        fontSize: p.fontSize,
        fontWeight: 600,
        fontFamily: p.fontFamily,
        backgroundColor: isFormValid
            ? p.buttonBackgroundColor
            : p.inputBorderColor,
        color: isFormValid ? p.buttonTextColor : "#94a3b8",
        border: "none",
        borderRadius: p.borderRadius * 0.67,
        cursor: isFormValid && !isSubmitting ? "pointer" : "not-allowed",
        transition: "all 0.2s ease",
        opacity: isSubmitting ? 0.7 : 1,
    }

    const fieldGroupStyle: CSSProperties = {
        marginBottom: 20,
    }

    const messageStyle: CSSProperties = {
        padding: "12px 16px",
        borderRadius: p.borderRadius * 0.5,
        fontSize: p.fontSize * 0.875,
        marginTop: 16,
        backgroundColor:
            message?.type === "success"
                ? "rgba(34, 197, 94, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
        color: message?.type === "success" ? "#16a34a" : "#dc2626",
        border: `1px solid ${message?.type === "success" ? "#22c55e" : "#ef4444"}`,
    }

    return (
        <form style={containerStyle} onSubmit={handleSubmit}>
            {/* Dream Job Input */}
            <div style={fieldGroupStyle}>
                <label style={labelStyle}>{p.dreamJobLabel}</label>
                <input
                    type="text"
                    value={dreamJob}
                    onChange={(e) => setDreamJob(e.target.value)}
                    placeholder={p.dreamJobPlaceholder}
                    style={inputStyle}
                    disabled={isSubmitting}
                    maxLength={200}
                />
            </div>

            {/* Country Select */}
            <div style={fieldGroupStyle}>
                <label style={labelStyle}>{p.countryLabel}</label>
                <select
                    value={selectedCountry?.code || ""}
                    onChange={(e) => {
                        const country = countriesSorted.find(
                            (c) => c.code === e.target.value
                        )
                        setSelectedCountry(country || null)
                    }}
                    style={selectStyle}
                    disabled={isSubmitting}
                >
                    <option value="" disabled>
                        {p.countryPlaceholder}
                    </option>
                    {countriesSorted.map((country) => (
                        <option key={country.code} value={country.code}>
                            {country.flag} {country.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Email Input */}
            <div style={fieldGroupStyle}>
                <label style={labelStyle}>{p.emailLabel}</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={p.emailPlaceholder}
                    style={inputStyle}
                    disabled={isSubmitting}
                />
            </div>

            {/* Submit Button */}
            <button type="submit" style={buttonStyle} disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? p.submittingText : p.submitButtonText}
            </button>

            {/* Message */}
            {message && <div style={messageStyle}>{message.text}</div>}
        </form>
    )
}

// Framer Property Controls
addPropertyControls(DreamJobForm, {
    // Colors
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: defaultProps.backgroundColor,
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: defaultProps.textColor,
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: defaultProps.accentColor,
    },
    inputBackgroundColor: {
        type: ControlType.Color,
        title: "Input BG",
        defaultValue: defaultProps.inputBackgroundColor,
    },
    inputBorderColor: {
        type: ControlType.Color,
        title: "Input Border",
        defaultValue: defaultProps.inputBorderColor,
    },
    buttonBackgroundColor: {
        type: ControlType.Color,
        title: "Button BG",
        defaultValue: defaultProps.buttonBackgroundColor,
    },
    buttonTextColor: {
        type: ControlType.Color,
        title: "Button Text",
        defaultValue: defaultProps.buttonTextColor,
    },

    // Layout
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: defaultProps.borderRadius,
        min: 0,
        max: 32,
        step: 1,
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: defaultProps.padding,
        min: 0,
        max: 64,
        step: 4,
    },

    // Typography
    fontFamily: {
        type: ControlType.String,
        title: "Font",
        defaultValue: defaultProps.fontFamily,
    },
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: defaultProps.fontSize,
        min: 12,
        max: 24,
        step: 1,
    },

    // Labels
    dreamJobLabel: {
        type: ControlType.String,
        title: "Job Label",
        defaultValue: defaultProps.dreamJobLabel,
    },
    dreamJobPlaceholder: {
        type: ControlType.String,
        title: "Job Placeholder",
        defaultValue: defaultProps.dreamJobPlaceholder,
    },
    countryLabel: {
        type: ControlType.String,
        title: "Country Label",
        defaultValue: defaultProps.countryLabel,
    },
    emailLabel: {
        type: ControlType.String,
        title: "Email Label",
        defaultValue: defaultProps.emailLabel,
    },
    submitButtonText: {
        type: ControlType.String,
        title: "Button Text",
        defaultValue: defaultProps.submitButtonText,
    },
    successMessage: {
        type: ControlType.String,
        title: "Success Msg",
        defaultValue: defaultProps.successMessage,
    },
})
