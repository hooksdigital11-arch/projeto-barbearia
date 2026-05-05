'use client'

import { cn } from '@/lib/utils/cn'

interface ClientAvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

/** Gera cor HSL determinística a partir do nome */
function hashColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return `hsl(${hue}, 60%, 45%)`
}

/** Extrai 2 iniciais do nome */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '??'
  const first = parts[0] ?? ''
  const last = parts[parts.length - 1] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase()
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
}

export function ClientAvatar({ name, size = 'md', className }: ClientAvatarProps) {
  const color = hashColor(name)
  const initials = getInitials(name)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 select-none',
        sizes[size],
        className
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  )
}
