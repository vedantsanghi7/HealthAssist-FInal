"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Full dropdown menu toggle
export function ModeToggle() {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-10 w-10 rounded-xl transition-all duration-300",
                        "bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10",
                        "border border-white/60 dark:border-white/10",
                        "shadow-sm hover:shadow-md dark:shadow-none"
                    )}
                >
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 text-amber-500 dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 text-blue-400 dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className={cn(
                    "min-w-[140px] rounded-xl p-1",
                    "bg-white/90 dark:bg-[#111827]/95 backdrop-blur-xl",
                    "border border-white/60 dark:border-white/10",
                    "shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}
            >
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn(
                        "rounded-lg cursor-pointer transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-white/10",
                        "focus:bg-slate-100 dark:focus:bg-white/10",
                        theme === "light" && "bg-slate-100 dark:bg-white/10"
                    )}
                >
                    <Sun className="mr-2 h-4 w-4 text-amber-500" />
                    <span className="dark:text-white">Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "rounded-lg cursor-pointer transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-white/10",
                        "focus:bg-slate-100 dark:focus:bg-white/10",
                        theme === "dark" && "bg-slate-100 dark:bg-white/10"
                    )}
                >
                    <Moon className="mr-2 h-4 w-4 text-blue-500" />
                    <span className="dark:text-white">Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(
                        "rounded-lg cursor-pointer transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-white/10",
                        "focus:bg-slate-100 dark:focus:bg-white/10",
                        theme === "system" && "bg-slate-100 dark:bg-white/10"
                    )}
                >
                    <svg className="mr-2 h-4 w-4 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="dark:text-white">System</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// Simple inline toggle button (for compact spaces)
export function ThemeToggleButton() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-white/50 dark:bg-white/5"
            >
                <span className="h-5 w-5" />
            </Button>
        )
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className={cn(
                "relative h-10 w-10 rounded-xl transition-all duration-300 overflow-hidden",
                "bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10",
                "border border-white/60 dark:border-white/10",
                "shadow-sm hover:shadow-md dark:shadow-none",
                "group"
            )}
        >
            <Sun className={cn(
                "absolute h-5 w-5 transition-all duration-500 text-amber-500",
                theme === "dark" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            )} />
            <Moon className={cn(
                "absolute h-5 w-5 transition-all duration-500 text-blue-400",
                theme === "dark" ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            )} />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
