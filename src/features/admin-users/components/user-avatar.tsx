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
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    barber: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    client: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  }

  const colorClass = roleColors[role || 'client'] || roleColors.client

  if (url) {
    return (
      <div className={cn("relative w-10 h-10 rounded-full overflow-hidden border", className)}>
        <img src={url} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={cn(
      "w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm",
      colorClass,
      className
    )}>
      {initials || <User size={20} weight="duotone" />}
    </div>
  )
}
