'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils/cn"
import { 
  SquaresFour, 
  Calendar, 
  Users, 
  Receipt, 
  Queue, 
  Star, 
  UserCircle, 
  Package, 
  ChatTeardropText, 
  ChartPieSlice, 
  Gear,
  Scissors 
} from "@phosphor-icons/react"

const ICONS = {
  SquaresFour,
  Calendar,
  Users,
  Receipt,
  Queue,
  Star,
  UserCircle,
  Package,
  ChatTeardropText,
  ChartPieSlice,
  Gear,
  Scissors
}

export type IconName = keyof typeof ICONS

interface NavItem {
  label: string
  href: string
  iconName: IconName
}

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide py-2">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const Icon = ICONS[item.iconName] || SquaresFour

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-12 py-4 text-sm font-bold transition-all group relative",
              "text-text-muted hover:text-white hover:bg-white/[0.02]",
              isActive && "text-white"
            )}
          >
            <Icon 
              size={20} 
              weight="bold" 
              className={cn("transition-all", isActive ? "text-accent-cyan" : "group-hover:text-accent-cyan opacity-40 group-hover:opacity-100")} 
            />
            <span className={cn(
              "uppercase tracking-[0.2em] text-[10px] transition-all",
              isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
            )}>
              {item.label}
            </span>
            
            {/* Active State Indicator: 2px left border */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-[2px] bg-accent-cyan transition-all duration-300",
              isActive ? "opacity-100" : "opacity-0"
            )} />
          </Link>
        )
      })}
    </nav>
  )
}
