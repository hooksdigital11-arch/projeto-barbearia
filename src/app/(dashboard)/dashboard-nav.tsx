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
    <nav className="flex-1 space-y-px overflow-y-auto scrollbar-hide py-2">
      {items.map((item) => {
        // Fix: Home should only be active on exact match to avoid highlighting both Home and sub-items
        const isHome = item.label === 'Home' || item.href === '/admin' || item.href === '/barber' || item.href === '/client'
        const isActive = isHome 
          ? pathname === item.href 
          : pathname === item.href || pathname.startsWith(item.href + '/')
        const Icon = ICONS[item.iconName] || SquaresFour

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              "flex items-center gap-3 px-[20px] py-[9px] min-h-[44px] text-[12px] font-medium transition-all group relative",
              "text-text-nav hover:text-text-primary hover:bg-nav-hover",
              isActive && "text-text-primary bg-nav-hover"
            )}
          >
            <Icon 
              size={16} 
              weight="regular" 
              className={cn("transition-all", !isActive && "group-hover:text-text-primary")} 
              style={isActive ? { color: 'var(--accent, #00d4aa)' } : undefined}
            />
            <span className="tracking-[0.06em] transition-all">
              {item.label}
            </span>
            
            {/* Active State Indicator: 2px right border */}
            <div 
              className={cn(
                "absolute right-0 top-0 bottom-0 w-[2px] transition-all duration-200",
                isActive ? "opacity-100" : "opacity-0"
              )} 
              style={{ background: 'var(--accent, #00d4aa)' }}
            />
          </Link>
        )
      })}
    </nav>
  )
}
