/**
 * Dream Job Counter Component for Framer
 *
 * Displays the total count of dream job submissions with:
 * - Real-time updates
 * - Animated number transitions
 * - Customizable formatting
 *
 * USAGE:
 * 1. Copy this file to your Framer project's code folder
 * 2. The component will appear in your Components panel
 * 3. Drag it onto your canvas and configure via the properties panel
 */

import { addPropertyControls, ControlType, motion } from "framer"
import { useState, useEffect, CSSProperties } from "react"
import { getDreamJobsCount, subscribeToFeed } from "./supabaseClient"

// Props interface
interface DreamJobCounterProps {
    // Display
    prefix: string
    suffix: string
    showAnimation: boolean
    animationDuration: number
    formatNumber: boolean

    // Styling
    backgroundColor: string
    textColor: string
    fontSize: number
    fontWeight: number
    fontFamily: string
    padding: number
    borderRadius: number
    textAlign: "left" | "center" | "right"

    // Layout
    direction: "row" | "column"
    gap: number
}

// Default props
const defaultProps: DreamJobCounterProps = {
    prefix: "",
    suffix: " dreamers worldwide",
    showAnimation: true,
    animationDuration: 0.5,
    formatNumber: true,

    backgroundColor: "transparent",
    textColor: "#1a1a2e",
    fontSize: 32,
    fontWeight: 700,
    fontFamily: "Inter, system-ui, sans-serif",
    padding: 0,
    borderRadius: 0,
    textAlign: "center",

    direction: "row",
    gap: 0,
}

// Format number with commas
function formatNumberWithCommas(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

// Animated counter hook
function useAnimatedCounter(
    targetValue: number,
    duration: number,
    enabled: boolean
): number {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        if (!enabled) {
            setDisplayValue(targetValue)
            return
        }

        const startValue = displayValue
        const startTime = performance.now()
        const diff = targetValue - startValue

        if (diff === 0) return

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = Math.round(startValue + diff * eased)

            setDisplayValue(current)

            if (progress < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [targetValue, duration, enabled])

    return displayValue
}

export default function DreamJobCounter(props: DreamJobCounterProps) {
    const p = { ...defaultProps, ...props }

    const [count, setCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const displayCount = useAnimatedCounter(
        count,
        p.animationDuration,
        p.showAnimation
    )

    // Fetch initial count and subscribe to updates
    useEffect(() => {
        let unsubscribe: (() => void) | null = null

        const initCounter = async () => {
            setIsLoading(true)
            try {
                const initialCount = await getDreamJobsCount()
                setCount(initialCount)
            } catch (err) {
                console.error("Failed to fetch count:", err)
            } finally {
                setIsLoading(false)
            }

            // Subscribe to real-time updates
            unsubscribe = subscribeToFeed(
                () => {
                    // Increment count on new entry
                    setCount((prev) => prev + 1)
                },
                (error) => {
                    console.error("Counter subscription error:", error)
                }
            )
        }

        initCounter()

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [])

    const formattedCount = p.formatNumber
        ? formatNumberWithCommas(displayCount)
        : displayCount.toString()

    // Styles
    const containerStyle: CSSProperties = {
        backgroundColor: p.backgroundColor,
        borderRadius: p.borderRadius,
        padding: p.padding,
        fontFamily: p.fontFamily,
        display: "flex",
        flexDirection: p.direction,
        alignItems: p.direction === "row" ? "baseline" : "center",
        justifyContent:
            p.textAlign === "center"
                ? "center"
                : p.textAlign === "right"
                  ? "flex-end"
                  : "flex-start",
        gap: p.gap,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
    }

    const numberStyle: CSSProperties = {
        color: p.textColor,
        fontSize: p.fontSize,
        fontWeight: p.fontWeight,
        fontFamily: p.fontFamily,
        lineHeight: 1.2,
        fontFeatureSettings: '"tnum"', // Tabular numbers for consistent width
    }

    const textStyle: CSSProperties = {
        color: p.textColor,
        fontSize: p.fontSize * 0.5,
        fontWeight: 400,
        fontFamily: p.fontFamily,
        opacity: 0.8,
    }

    const loadingStyle: CSSProperties = {
        ...containerStyle,
        opacity: 0.5,
    }

    if (isLoading) {
        return (
            <div style={loadingStyle}>
                <span style={numberStyle}>--</span>
            </div>
        )
    }

    return (
        <motion.div
            style={containerStyle}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            {p.prefix && <span style={textStyle}>{p.prefix}</span>}
            <motion.span
                style={numberStyle}
                key={count}
                initial={p.showAnimation ? { scale: 1.1 } : undefined}
                animate={p.showAnimation ? { scale: 1 } : undefined}
                transition={{ duration: 0.2 }}
            >
                {formattedCount}
            </motion.span>
            {p.suffix && <span style={textStyle}>{p.suffix}</span>}
        </motion.div>
    )
}

// Framer Property Controls
addPropertyControls(DreamJobCounter, {
    // Display
    prefix: {
        type: ControlType.String,
        title: "Prefix",
        defaultValue: defaultProps.prefix,
        placeholder: "e.g., 'Join '",
    },
    suffix: {
        type: ControlType.String,
        title: "Suffix",
        defaultValue: defaultProps.suffix,
        placeholder: "e.g., ' dreamers'",
    },
    showAnimation: {
        type: ControlType.Boolean,
        title: "Animate",
        defaultValue: defaultProps.showAnimation,
    },
    animationDuration: {
        type: ControlType.Number,
        title: "Duration",
        defaultValue: defaultProps.animationDuration,
        min: 0.1,
        max: 2,
        step: 0.1,
        hidden: (props) => !props.showAnimation,
    },
    formatNumber: {
        type: ControlType.Boolean,
        title: "Format",
        defaultValue: defaultProps.formatNumber,
    },

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

    // Typography
    fontSize: {
        type: ControlType.Number,
        title: "Font Size",
        defaultValue: defaultProps.fontSize,
        min: 16,
        max: 120,
        step: 2,
    },
    fontWeight: {
        type: ControlType.Number,
        title: "Font Weight",
        defaultValue: defaultProps.fontWeight,
        min: 100,
        max: 900,
        step: 100,
    },
    fontFamily: {
        type: ControlType.String,
        title: "Font",
        defaultValue: defaultProps.fontFamily,
    },

    // Layout
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: defaultProps.padding,
        min: 0,
        max: 48,
        step: 4,
    },
    borderRadius: {
        type: ControlType.Number,
        title: "Radius",
        defaultValue: defaultProps.borderRadius,
        min: 0,
        max: 32,
        step: 1,
    },
    textAlign: {
        type: ControlType.Enum,
        title: "Align",
        options: ["left", "center", "right"],
        optionTitles: ["Left", "Center", "Right"],
        defaultValue: defaultProps.textAlign,
    },
    direction: {
        type: ControlType.Enum,
        title: "Direction",
        options: ["row", "column"],
        optionTitles: ["Horizontal", "Vertical"],
        defaultValue: defaultProps.direction,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: defaultProps.gap,
        min: 0,
        max: 24,
        step: 2,
    },
})
