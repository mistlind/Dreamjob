import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { supabaseFetch } from "../Lib/SupabaseClient.ts"
import { countriesSorted, getCountryByCode } from "../Lib/CountriesData.ts"

// =============================================================================
// Types
// =============================================================================

interface BorderValue {
    color?: string
    width?: number
    style?: "solid" | "dashed" | "dotted" | "double" | "none"
}

interface ShadowValue {
    x: number
    y: number
    blur: number
    spread: number
    color: string
}

interface RadiusValue {
    topLeft?: number
    topRight?: number
    bottomRight?: number
    bottomLeft?: number
}

interface Props {
    // Layout
    layout: "horizontal" | "vertical"
    gap: number
    columnsGap: number
    padding: number
    align: "stretch" | "flex-end" | "center" | "flex-start"

    // Labels
    showLabels: boolean
    labelFont: React.CSSProperties
    labelColor: string

    // Input styles
    inputFont: React.CSSProperties
    inputTextColor: string
    inputPlaceholderColor: string
    inputOpacity: number
    inputFill: string
    inputRadius: number | RadiusValue
    inputPadding: number | string
    inputBorder: BorderValue
    inputShadow: ShadowValue
    inputFocusFill: string
    inputFocusBorderColor: string

    // Focus ring
    focusRingColor: string
    focusRingWidth: number

    // Button styles
    buttonFont: React.CSSProperties
    buttonTextColor: string
    buttonFill: string
    buttonFillHover: string
    buttonFillSubmitted: string
    buttonOpacity: number
    buttonRadius: number | RadiusValue
    buttonPadding: number | string
    buttonBorder: BorderValue
    buttonShadow: ShadowValue
    buttonText: string
    buttonTextSubmitting: string
    buttonTextSubmitted: string

    // Copy
    jobLabel: string
    countryLabel: string
    emailLabel: string
    jobPlaceholder: string
    emailPlaceholder: string

    // Behaviour
    defaultCountryCode: string
    resetAfterSubmit: boolean
    disableWhileSubmitting: boolean
}

// =============================================================================
// Utility Functions
// =============================================================================

const formatBorder = (border?: BorderValue): string => {
    if (!border || border.style === "none" || (border.width ?? 0) <= 0) {
        return "none"
    }
    return `${border.width ?? 1}px ${border.style ?? "solid"} ${border.color ?? "#e6e6e6"}`
}

const formatShadow = (shadow?: ShadowValue): string => {
    if (!shadow) return "none"
    return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
}

const formatRadius = (radius: number | RadiusValue | undefined): string => {
    if (radius === undefined) return "0px"
    if (typeof radius === "number") return `${radius}px`
    const { topLeft = 0, topRight = 0, bottomRight = 0, bottomLeft = 0 } = radius
    return `${topLeft}px ${topRight}px ${bottomRight}px ${bottomLeft}px`
}

// =============================================================================
// Component
// =============================================================================

function DreamJobForm(props: Props) {
    const {
        layout,
        gap,
        columnsGap,
        padding,
        align,
        showLabels,
        labelFont,
        labelColor,
        inputFont,
        inputTextColor,
        inputPlaceholderColor,
        inputOpacity,
        inputFill,
        inputRadius,
        inputPadding,
        inputBorder,
        inputShadow,
        inputFocusFill,
        inputFocusBorderColor,
        focusRingColor,
        focusRingWidth,
        buttonFont,
        buttonTextColor,
        buttonFill,
        buttonFillHover,
        buttonFillSubmitted,
        buttonOpacity,
        buttonRadius,
        buttonPadding,
        buttonBorder,
        buttonShadow,
        buttonText,
        buttonTextSubmitting,
        buttonTextSubmitted,
        jobLabel,
        countryLabel,
        emailLabel,
        jobPlaceholder,
        emailPlaceholder,
        defaultCountryCode,
        resetAfterSubmit,
        disableWhileSubmitting,
    } = props

    // =========================================================================
    // State
    // =========================================================================

    const [dreamJob, setDreamJob] = React.useState("")
    const [countryCode, setCountryCode] = React.useState(defaultCountryCode || "GB")
    const [email, setEmail] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isSubmitted, setIsSubmitted] = React.useState(false)

    const uid = React.useId()
    const isHorizontal = layout === "horizontal"

    // =========================================================================
    // Memoized Styles
    // =========================================================================

    const styles = React.useMemo(() => {
        const borderFormatted = formatBorder(inputBorder)
        const shadowFormatted = formatShadow(inputShadow)
        const radiusFormatted = formatRadius(inputRadius)
        const buttonRadiusFormatted = formatRadius(buttonRadius)
        const buttonBorderFormatted = formatBorder(buttonBorder)
        const buttonShadowFormatted = formatShadow(buttonShadow)

        return {
            container: {
                width: "100%",
                boxSizing: "border-box" as const,
                padding,
                display: "flex",
                flexDirection: "column" as const,
                gap,
            },
            row: {
                display: "flex",
                flexDirection: isHorizontal ? "row" : "column",
                gap: columnsGap,
                alignItems: isHorizontal ? align : "stretch",
                width: "100%",
                minWidth: 0,
            } as React.CSSProperties,
            column: {
                flex: isHorizontal ? 1 : undefined,
                width: isHorizontal ? 0 : "100%",
                minWidth: isHorizontal ? 0 : undefined,
                display: "flex",
                flexDirection: "column" as const,
                boxSizing: "border-box" as const,
            },
            label: {
                ...labelFont,
                color: labelColor,
                marginBottom: 8,
                lineHeight: 1.2,
                whiteSpace: "normal" as const,
            },
            field: {
                ...inputFont,
                color: inputTextColor,
                background: inputFill,
                opacity: inputOpacity,
                borderRadius: radiusFormatted,
                padding: inputPadding,
                border: borderFormatted,
                boxShadow: shadowFormatted,
                width: "100%",
                boxSizing: "border-box" as const,
                outline: "none",
                appearance: "none" as const,
                transition: "border-color 150ms ease, background 150ms ease, box-shadow 150ms ease",
            },
            button: {
                ...buttonFont,
                color: buttonTextColor,
                background: buttonFill,
                opacity: buttonOpacity,
                borderRadius: buttonRadiusFormatted,
                padding: buttonPadding,
                border: buttonBorderFormatted,
                boxShadow: buttonShadowFormatted,
                width: "100%",
                boxSizing: "border-box" as const,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                userSelect: "none" as const,
                outline: "none",
                transition: "background 150ms ease, opacity 150ms ease, transform 100ms ease, box-shadow 150ms ease",
            },
            hiddenLabel: {
                ...labelFont,
                color: labelColor,
                marginBottom: 8,
                lineHeight: 1.2,
                opacity: 0,
                userSelect: "none" as const,
                pointerEvents: "none" as const,
            },
        }
    }, [
        padding, gap, isHorizontal, columnsGap, align, labelFont, labelColor,
        inputFont, inputTextColor, inputFill, inputOpacity, inputRadius,
        inputPadding, inputBorder, inputShadow, buttonFont, buttonTextColor,
        buttonFill, buttonOpacity, buttonRadius, buttonPadding, buttonBorder, buttonShadow,
    ])

    // =========================================================================
    // Dynamic CSS for pseudo-states
    // =========================================================================

    const dynamicCSS = React.useMemo(() => {
        const baseShadow = formatShadow(inputShadow)
        const btnShadow = formatShadow(buttonShadow)
        const focusShadow = baseShadow !== "none"
            ? `${baseShadow}, 0 0 0 ${focusRingWidth}px ${focusRingColor}`
            : `0 0 0 ${focusRingWidth}px ${focusRingColor}`
        const btnFocusShadow = btnShadow !== "none"
            ? `${btnShadow}, 0 0 0 ${focusRingWidth}px ${focusRingColor}`
            : `0 0 0 ${focusRingWidth}px ${focusRingColor}`

        return `
            .djf-field-${uid}::placeholder {
                color: ${inputPlaceholderColor};
                opacity: 1;
            }
            .djf-field-${uid}:hover {
                border-color: ${inputFocusBorderColor};
            }
            .djf-field-${uid}:focus,
            .djf-field-${uid}:focus-visible {
                background: ${inputFocusFill};
                border-color: ${inputFocusBorderColor};
                box-shadow: ${focusShadow};
            }
            .djf-btn-${uid}:hover:not(:disabled) {
                background: ${buttonFillHover};
            }
            .djf-btn-${uid}:active:not(:disabled) {
                transform: scale(0.98);
            }
            .djf-btn-${uid}:focus,
            .djf-btn-${uid}:focus-visible {
                box-shadow: ${btnFocusShadow};
            }
            .djf-btn-${uid}:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
            .djf-btn-${uid}.submitted {
                background: ${buttonFillSubmitted};
            }
        `
    }, [
        uid, inputPlaceholderColor, inputFocusFill, inputFocusBorderColor,
        focusRingWidth, focusRingColor, inputShadow, buttonShadow,
        buttonFillHover, buttonFillSubmitted,
    ])

    // =========================================================================
    // Event Handlers
    // =========================================================================

    const handleDreamJobChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setDreamJob(e.target.value),
        []
    )

    const handleCountryChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => setCountryCode(e.target.value),
        []
    )

    const handleEmailChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
        []
    )

    const handleSubmit = React.useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault()
            if (disableWhileSubmitting && isSubmitting) return

            const job = dreamJob.trim()
            const mail = email.trim()
            const cc = countryCode.trim().toUpperCase()

            if (!job || !mail || !cc) return

            setIsSubmitting(true)
            setIsSubmitted(false)

            const country = getCountryByCode(cc)
            const countryName = country?.name ?? cc

            try {
                const res = await supabaseFetch("dream_jobs", {
                    method: "POST",
                    body: {
                        dream_job: job,
                        country_code: cc,
                        country_name: countryName,
                        email: mail,
                    },
                })

                if (res.ok) {
                    setIsSubmitted(true)
                    if (resetAfterSubmit) {
                        setDreamJob("")
                        setEmail("")
                    }
                }
            } finally {
                setIsSubmitting(false)
            }
        },
        [dreamJob, email, countryCode, isSubmitting, disableWhileSubmitting, resetAfterSubmit]
    )

    // =========================================================================
    // Computed Values
    // =========================================================================

    const buttonLabel = isSubmitting
        ? buttonTextSubmitting
        : isSubmitted
            ? buttonTextSubmitted
            : buttonText

    const isDisabled = disableWhileSubmitting && isSubmitting

    // =========================================================================
    // Render
    // =========================================================================

    return (
        <form onSubmit={handleSubmit} style={styles.container}>
            <style>{dynamicCSS}</style>

            <div style={styles.row}>
                {/* Dream Job Field */}
                <div style={styles.column}>
                    {showLabels && (
                        <label style={styles.label} htmlFor={`job-${uid}`}>
                            {jobLabel}
                        </label>
                    )}
                    <input
                        id={`job-${uid}`}
                        className={`djf-field-${uid}`}
                        style={styles.field}
                        type="text"
                        placeholder={jobPlaceholder}
                        value={dreamJob}
                        onChange={handleDreamJobChange}
                        required
                        aria-label={jobLabel}
                        autoComplete="organization-title"
                    />
                </div>

                {/* Country Field */}
                <div style={styles.column}>
                    {showLabels && (
                        <label style={styles.label} htmlFor={`country-${uid}`}>
                            {countryLabel}
                        </label>
                    )}
                    <select
                        id={`country-${uid}`}
                        className={`djf-field-${uid}`}
                        style={styles.field}
                        value={countryCode}
                        onChange={handleCountryChange}
                        required
                        aria-label={countryLabel}
                    >
                        {countriesSorted.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Email Field */}
                <div style={styles.column}>
                    {showLabels && (
                        <label style={styles.label} htmlFor={`email-${uid}`}>
                            {emailLabel}
                        </label>
                    )}
                    <input
                        id={`email-${uid}`}
                        className={`djf-field-${uid}`}
                        style={styles.field}
                        type="email"
                        placeholder={emailPlaceholder}
                        value={email}
                        onChange={handleEmailChange}
                        required
                        aria-label={emailLabel}
                        autoComplete="email"
                    />
                </div>

                {/* Submit Button */}
                <div style={styles.column}>
                    {showLabels && isHorizontal && (
                        <span style={styles.hiddenLabel} aria-hidden="true">
                            &nbsp;
                        </span>
                    )}
                    <button
                        type="submit"
                        className={`djf-btn-${uid}${isSubmitted ? " submitted" : ""}`}
                        style={styles.button}
                        disabled={isDisabled}
                        aria-label={buttonLabel}
                    >
                        {buttonLabel}
                    </button>
                </div>
            </div>
        </form>
    )
}

// =============================================================================
// Property Controls
// =============================================================================

addPropertyControls(DreamJobForm, {
    // Layout Section
    layout: {
        type: ControlType.Enum,
        title: "Layout",
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal", "Vertical"],
        defaultValue: "horizontal",
    },
    gap: {
        type: ControlType.Number,
        title: "Row Gap",
        defaultValue: 12,
        min: 0,
        max: 48,
        step: 1,
    },
    columnsGap: {
        type: ControlType.Number,
        title: "Column Gap",
        defaultValue: 18,
        min: 0,
        max: 64,
        step: 1,
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: 0,
        min: 0,
        max: 64,
        step: 1,
    },
    align: {
        type: ControlType.Enum,
        title: "Align",
        options: ["stretch", "flex-end", "center", "flex-start"],
        optionTitles: ["Stretch", "Bottom", "Center", "Top"],
        defaultValue: "stretch",
        hidden: (props) => props.layout !== "horizontal",
    },

    // Labels Section
    showLabels: {
        type: ControlType.Boolean,
        title: "Show Labels",
        defaultValue: true,
    },
    labelFont: {
        type: ControlType.Font,
        title: "Label Font",
        defaultValue: {
            family: "Inter",
            size: 14,
            weight: 500,
            lineHeight: "1.2em",
        },
        hidden: (props) => !props.showLabels,
    },
    labelColor: {
        type: ControlType.Color,
        title: "Label Color",
        defaultValue: "rgba(0,0,0,0.55)",
        hidden: (props) => !props.showLabels,
    },

    // Input Styles Section
    inputFont: {
        type: ControlType.Font,
        title: "Input Font",
        defaultValue: {
            family: "Inter",
            size: 16,
            weight: 400,
            lineHeight: "1.2em",
        },
    },
    inputTextColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: "#111111",
    },
    inputPlaceholderColor: {
        type: ControlType.Color,
        title: "Placeholder",
        defaultValue: "#999999",
    },
    inputFill: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: "#ffffff",
    },
    inputFocusFill: {
        type: ControlType.Color,
        title: "Focus Background",
        defaultValue: "#ffffff",
    },
    inputFocusBorderColor: {
        type: ControlType.Color,
        title: "Focus Border",
        defaultValue: "#007AFF",
    },
    inputOpacity: {
        type: ControlType.Number,
        title: "Opacity",
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.01,
    },
    inputRadius: {
        type: ControlType.FusedNumber,
        title: "Radius",
        defaultValue: 12,
        toggleKey: "inputRadiusMixed",
        toggleTitles: ["All", "Individual"],
        valueKeys: ["topLeft", "topRight", "bottomRight", "bottomLeft"],
        valueLabels: ["TL", "TR", "BR", "BL"],
        min: 0,
    },
    inputPadding: {
        type: ControlType.FusedNumber,
        title: "Padding",
        defaultValue: 14,
        toggleKey: "inputPaddingMixed",
        toggleTitles: ["All", "Individual"],
        valueKeys: ["top", "right", "bottom", "left"],
        valueLabels: ["T", "R", "B", "L"],
        min: 0,
    },
    inputBorder: {
        type: ControlType.Object,
        title: "Border",
        controls: {
            width: {
                type: ControlType.Number,
                title: "Width",
                defaultValue: 1,
                min: 0,
                max: 10,
                step: 1,
            },
            color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#e6e6e6",
            },
            style: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "none"],
                defaultValue: "solid",
            },
        },
    },
    inputShadow: {
        type: ControlType.BoxShadow,
        title: "Shadow",
    },

    // Focus Ring
    focusRingColor: {
        type: ControlType.Color,
        title: "Focus Ring Color",
        defaultValue: "rgba(0, 122, 255, 0.35)",
    },
    focusRingWidth: {
        type: ControlType.Number,
        title: "Focus Ring Width",
        defaultValue: 3,
        min: 0,
        max: 12,
        step: 1,
    },

    // Button Styles Section
    buttonFont: {
        type: ControlType.Font,
        title: "Button Font",
        defaultValue: {
            family: "Inter",
            size: 16,
            weight: 600,
            lineHeight: "1.2em",
        },
    },
    buttonTextColor: {
        type: ControlType.Color,
        title: "Button Text",
        defaultValue: "#ffffff",
    },
    buttonFill: {
        type: ControlType.Color,
        title: "Button Fill",
        defaultValue: "#111111",
    },
    buttonFillHover: {
        type: ControlType.Color,
        title: "Hover Fill",
        defaultValue: "#333333",
    },
    buttonFillSubmitted: {
        type: ControlType.Color,
        title: "Submitted Fill",
        defaultValue: "#16a34a",
    },
    buttonOpacity: {
        type: ControlType.Number,
        title: "Button Opacity",
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.01,
    },
    buttonRadius: {
        type: ControlType.FusedNumber,
        title: "Button Radius",
        defaultValue: 14,
        toggleKey: "buttonRadiusMixed",
        toggleTitles: ["All", "Individual"],
        valueKeys: ["topLeft", "topRight", "bottomRight", "bottomLeft"],
        valueLabels: ["TL", "TR", "BR", "BL"],
        min: 0,
    },
    buttonPadding: {
        type: ControlType.FusedNumber,
        title: "Button Padding",
        defaultValue: 14,
        toggleKey: "buttonPaddingMixed",
        toggleTitles: ["All", "Individual"],
        valueKeys: ["top", "right", "bottom", "left"],
        valueLabels: ["T", "R", "B", "L"],
        min: 0,
    },
    buttonBorder: {
        type: ControlType.Object,
        title: "Button Border",
        controls: {
            width: {
                type: ControlType.Number,
                title: "Width",
                defaultValue: 0,
                min: 0,
                max: 10,
                step: 1,
            },
            color: {
                type: ControlType.Color,
                title: "Color",
                defaultValue: "#000000",
            },
            style: {
                type: ControlType.Enum,
                title: "Style",
                options: ["solid", "dashed", "dotted", "none"],
                defaultValue: "solid",
            },
        },
    },
    buttonShadow: {
        type: ControlType.BoxShadow,
        title: "Button Shadow",
    },
    buttonText: {
        type: ControlType.String,
        title: "Button Text",
        defaultValue: "Submit",
    },
    buttonTextSubmitting: {
        type: ControlType.String,
        title: "Submitting Text",
        defaultValue: "Submitting...",
    },
    buttonTextSubmitted: {
        type: ControlType.String,
        title: "Submitted Text",
        defaultValue: "Submitted!",
    },

    // Copy Section
    jobLabel: {
        type: ControlType.String,
        title: "Job Label",
        defaultValue: "What is your dream job?",
    },
    countryLabel: {
        type: ControlType.String,
        title: "Country Label",
        defaultValue: "Which country do you live in?",
    },
    emailLabel: {
        type: ControlType.String,
        title: "Email Label",
        defaultValue: "Email",
    },
    jobPlaceholder: {
        type: ControlType.String,
        title: "Job Placeholder",
        defaultValue: "Crane driver",
    },
    emailPlaceholder: {
        type: ControlType.String,
        title: "Email Placeholder",
        defaultValue: "you@example.com",
    },

    // Behaviour Section
    defaultCountryCode: {
        type: ControlType.String,
        title: "Default Country",
        defaultValue: "GB",
    },
    resetAfterSubmit: {
        type: ControlType.Boolean,
        title: "Reset After Submit",
        defaultValue: true,
    },
    disableWhileSubmitting: {
        type: ControlType.Boolean,
        title: "Disable While Submitting",
        defaultValue: true,
    },
})

export default DreamJobForm
