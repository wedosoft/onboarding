import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

interface ThemeProviderProps {
    children: React.ReactNode
    attribute?: "class" | "data-theme"
    defaultTheme?: string
    enableSystem?: boolean
    disableTransitionOnChange?: boolean
    storageKey?: string
}

export function ThemeProvider({
    children,
    attribute = "class",
    defaultTheme = "light",
    enableSystem = true,
    disableTransitionOnChange = false,
    storageKey = "onboarding-theme",
    ...props
}: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute={attribute}
            defaultTheme={defaultTheme}
            enableSystem={enableSystem}
            disableTransitionOnChange={disableTransitionOnChange}
            storageKey={storageKey}
            {...props}
        >
            {children}
        </NextThemesProvider>
    )
}
