'use client'

import { User } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface UserAvatarProps {
  name: string
  url?: string | null
  role?: string
  className?: string
}

export function UserAvatar({ name, url, role, className }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .filter(n => n.length > 0)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  // Unique color hash
  const getHashColor = (str: string) => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // violet
      '#ec4899', // pink
      '#f97316', // orange
      '#06b6d4', // cyan
      '#10b981', // emerald
      '#f59e0b', // amber
      '#6366f1', // indigo
    ]
    return colors[Math.abs(hash) % colors.length]
  }

  const bgColor = getHashColor(name || 'User')

  if (url) {
    return (
      <div className={cn("relative w-[34px] h-[34px] rounded-full overflow-hidden border border-white/10 shrink-0", className)}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div 
      className={cn(
        "w-[34px] h-[34px] rounded-full flex items-center justify-center font-medium text-[11px] text-text-primary shrink-0",
        className
      )}
      style={{ backgroundColor: bgColor }}
    >
      {initials || <User size={18} weight="bold" />}
    </div>
  )
}
