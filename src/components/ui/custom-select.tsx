'use client'

import * as React from 'react'
import { CaretDown, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  name?: string
}

export function CustomSelect({ options, value, onChange, placeholder, className, name }: CustomSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={value} />
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white transition-all outline-none focus:ring-2 focus:ring-accent-cyan/50",
          isOpen && "border-accent-cyan/50 ring-2 ring-accent-cyan/50"
        )}
      >
        <span className={cn(!selectedOption && "text-muted-foreground")}>
          {selectedOption ? selectedOption.label : placeholder || 'Selecione...'}
        </span>
        <CaretDown 
          size={16} 
          className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-[110] w-full mt-2 py-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-white/5",
                  option.value === value ? "text-accent-cyan font-bold bg-accent-cyan/5" : "text-muted-foreground"
                )}
              >
                {option.label}
                {option.value === value && <Check size={14} weight="bold" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
