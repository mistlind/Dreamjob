/**
 * Dream Job Live Feed Component for Framer
 *
 * Displays dream job submissions in a real-time feed with:
 * - Auto-scrolling animation
 * - Country flags
 * - Relative timestamps
 * - Real-time updates via Supabase
 *
 * USAGE:
 * 1. Copy this file to your Framer project's code folder
 * 2. The component will appear in your Components panel
 * 3. Drag it onto your canvas and configure via the properties panel
 */

import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useRef, CSSProperties } from "react"
import { getDreamJobsFeed, subscribeToFeed, DreamJobFeed } from "./supabaseClient"
import { getCountryByCode } from "./countries"

// Props interface
interface DreamJobFeedProps {
    // Display
    maxItems: number
    showCountryFlag: boolean
    showTimestamp: boolean
    autoScroll: boolean
    scrollSpeed: number
    pauseOnHover: boolean

    // Styling
    backgroundColor: string
    cardBackgroundColor: string
    textColor: string
    secondaryTextColor: string
    accentColor: string
    borderRadius: number
    cardBorderRadius: number
    padding: number
    cardPadding: number
    gap: number
    fontFamily: string
    fontSize: number

    // Empty state
    emptyMessage: string
    loadingMessage: string
}

// Default props
const defaultProps: DreamJobFeedProps = {
    maxItems: 50,
    showCountryFlag: true,
    showTimestamp: true,
    autoScroll: true,
    scrollSpeed: 30,
    pauseOnHover: true,

    backgroundColor: "transparent",
    cardBackgroundColor: "#ffffff",
    textColor: "#1a1a2e",
    secondaryTextColor: "#64748b",
    accentColor: "#6366f1",
    borderRadius: 0,
    cardBorderRadius: 12,
    padding: 0,
    cardPadding: 16,
    gap: 12,
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 16,

    emptyMessage: "No dream jobs yet. Be the first to share yours!",
    loadingMessage: "Loading dreams...",
}

// Format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
        return "Just now"
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
        return `${diffInHours}h ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
        return `${diffInDays}d ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
        return `${diffInWeeks}w ago`
    }

    return date.toLocaleDateString()
}

export default function DreamJobFeedComponent(props: DreamJobFeedProps) {
    const p = { ...defaultProps, ...props }

    const [items, setItems] = useState<DreamJobFeed[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isPaused, setIsPaused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollRef = useRef<number>(0)
    const animationRef = useRef<number | null>(null)

    // Fetch initial data and subscribe to updates
    useEffect(() => {
        let unsubscribe: (() => void) | null = null

        const initFeed = async () => {
            setIsLoading(true)
            try {
                const data = await getDreamJobsFeed(p.maxItems)
                setItems(data)
            } catch (err) {
                console.error("Failed to fetch feed:", err)
            } finally {
                setIsLoading(false)
            }

            // Subscribe to real-time updates
            unsubscribe = subscribeToFeed(
                (newJob) => {
                    setItems((prev) => {
                        const updated = [newJob, ...prev]
                        return updated.slice(0, p.maxItems)
                    })
                    // Reset scroll on new item
                    scrollRef.current = 0
                },
                (error) => {
                    console.error("Feed subscription error:", error)
                }
            )
        }

        initFeed()

        return () => {
            if (unsubscribe) {
                unsubscribe()
            }
        }
    }, [p.maxItems])

    // Auto-scroll animation
    useEffect(() => {
        if (!p.autoScroll || !containerRef.current) return

        const container = containerRef.current
        let lastTime = performance.now()

        const animate = (currentTime: number) => {
            if (!isPaused && container) {
                const delta = (currentTime - lastTime) / 1000
                scrollRef.current += p.scrollSpeed * delta

                const maxScroll = container.scrollHeight - container.clientHeight
                if (scrollRef.current >= maxScroll) {
                    scrollRef.current = 0
                }

                container.scrollTop = scrollRef.current
            }
            lastTime = currentTime
            animationRef.current = requestAnimationFrame(animate)
        }

        animationRef.current = requestAnimationFrame(animate)

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [p.autoScroll, p.scrollSpeed, isPaused])

    // Styles
    const containerStyle: CSSProperties = {
        backgroundColor: p.backgroundColor,
        borderRadius: p.borderRadius,
        padding: p.padding,
        fontFamily: p.fontFamily,
        fontSize: p.fontSize,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        boxSizing: "border-box",
    }

    const scrollContainerStyle: CSSProperties = {
        width: "100%",
        height: "100%",
        overflowY: "auto",
        overflowX: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
    }

    const feedListStyle: CSSProperties = {
        display: "flex",
        flexDirection: "column",
        gap: p.gap,
    }

    const cardStyle: CSSProperties = {
        backgroundColor: p.cardBackgroundColor,
        borderRadius: p.cardBorderRadius,
        padding: p.cardPadding,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }

    const dreamJobStyle: CSSProperties = {
        color: p.textColor,
        fontSize: p.fontSize,
        fontWeight: 600,
        marginBottom: 8,
        lineHeight: 1.4,
    }

    const metaStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontSize: p.fontSize * 0.875,
        color: p.secondaryTextColor,
    }

    const countryStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: 6,
    }

    const flagStyle: CSSProperties = {
        fontSize: p.fontSize * 1.25,
    }

    const emptyStyle: CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        color: p.secondaryTextColor,
        textAlign: "center",
        padding: 24,
    }

    const loadingStyle: CSSProperties = {
        ...emptyStyle,
        opacity: 0.7,
    }

    if (isLoading) {
        return (
            <div style={containerStyle}>
                <div style={loadingStyle}>{p.loadingMessage}</div>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div style={containerStyle}>
                <div style={emptyStyle}>{p.emptyMessage}</div>
            </div>
        )
    }

    return (
        <div style={containerStyle}>
            <style>
                {`
                    .dream-feed-scroll::-webkit-scrollbar {
                        display: none;
                    }
                    .dream-feed-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    }
                `}
            </style>
            <div
                ref={containerRef}
                className="dream-feed-scroll"
                style={scrollContainerStyle}
                onMouseEnter={() => p.pauseOnHover && setIsPaused(true)}
                onMouseLeave={() => p.pauseOnHover && setIsPaused(false)}
            >
                <div style={feedListStyle}>
                    {items.map((item) => {
                        const country = getCountryByCode(item.country_code)
                        return (
                            <div
                                key={item.id}
                                className="dream-feed-card"
                                style={cardStyle}
                            >
                                <div style={dreamJobStyle}>{item.dream_job}</div>
                                <div style={metaStyle}>
                                    {p.showCountryFlag && country && (
                                        <div style={countryStyle}>
                                            <span style={flagStyle}>
                                                {country.flag}
                                            </span>
                                            <span>{country.name}</span>
                                        </div>
                                    )}
                                    {p.showTimestamp && (
                                        <span>
                                            {formatRelativeTime(item.created_at)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

// Framer Property Controls
addPropertyControls(DreamJobFeedComponent, {
    // Display
    maxItems: {
        type: ControlType.Number,
        title: "Max Items",
        defaultValue: defaultProps.maxItems,
        min: 5,
        max: 100,
        step: 5,
    },
    showCountryFlag: {
        type: ControlType.Boolean,
        title: "Show Flag",
        defaultValue: defaultProps.showCountryFlag,
    },
    showTimestamp: {
        type: ControlType.Boolean,
        title: "Show Time",
        defaultValue: defaultProps.showTimestamp,
    },
    autoScroll: {
        type: ControlType.Boolean,
        title: "Auto Scroll",
        defaultValue: defaultProps.autoScroll,
    },
    scrollSpeed: {
        type: ControlType.Number,
        title: "Scroll Speed",
        defaultValue: defaultProps.scrollSpeed,
        min: 10,
        max: 100,
        step: 5,
        hidden: (props) => !props.autoScroll,
    },
    pauseOnHover: {
        type: ControlType.Boolean,
        title: "Pause Hover",
        defaultValue: defaultProps.pauseOnHover,
        hidden: (props) => !props.autoScroll,
    },

    // Colors
    backgroundColor: {
        type: ControlType.Color,
        title: "Background",
        defaultValue: defaultProps.backgroundColor,
    },
    cardBackgroundColor: {
        type: ControlType.Color,
        title: "Card BG",
        defaultValue: defaultProps.cardBackgroundColor,
    },
    textColor: {
        type: ControlType.Color,
        title: "Text Color",
        defaultValue: defaultProps.textColor,
    },
    secondaryTextColor: {
        type: ControlType.Color,
        title: "Secondary",
        defaultValue: defaultProps.secondaryTextColor,
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: defaultProps.accentColor,
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
    cardBorderRadius: {
        type: ControlType.Number,
        title: "Card Radius",
        defaultValue: defaultProps.cardBorderRadius,
        min: 0,
        max: 24,
        step: 1,
    },
    padding: {
        type: ControlType.Number,
        title: "Padding",
        defaultValue: defaultProps.padding,
        min: 0,
        max: 48,
        step: 4,
    },
    cardPadding: {
        type: ControlType.Number,
        title: "Card Padding",
        defaultValue: defaultProps.cardPadding,
        min: 8,
        max: 32,
        step: 4,
    },
    gap: {
        type: ControlType.Number,
        title: "Gap",
        defaultValue: defaultProps.gap,
        min: 4,
        max: 24,
        step: 2,
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

    // Messages
    emptyMessage: {
        type: ControlType.String,
        title: "Empty Msg",
        defaultValue: defaultProps.emptyMessage,
    },
})
