'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlass, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface SearchInputProps {
  onSearch: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ onSearch, placeholder, className }: SearchInputProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value, onSearch])

  return (
    <div className={cn("relative group w-full max-w-sm", className)}>
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-accent-cyan transition-colors">
        <MagnifyingGlass size={20} weight="bold" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder || "Buscar..."}
        className="w-full pl-12 pr-10 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-accent-cyan/50 focus:bg-white/10 transition-all"
      />
      {value && (
        <button 
          onClick={() => setValue('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white"
        >
          <X size={16} weight="bold" />
        </button>
      )}
    </div>
  )
}
