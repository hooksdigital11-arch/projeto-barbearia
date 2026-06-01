'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cn } from '@/lib/utils/cn'
import { WarningCircle } from '@phosphor-icons/react'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
}

type ConfirmContextType = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmContextType | null>(null)

export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm deve ser usado dentro de um ConfirmProvider')
  }
  return context
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setIsOpen(true)
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve
    })
  }, [])

  const handleClose = useCallback((value: boolean) => {
    setIsOpen(false)
    if (resolveRef.current) {
      resolveRef.current(value)
      resolveRef.current = null
    }
  }, [])

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => {
        if (!open) handleClose(false)
      }}>
        <DialogPrimitive.Portal>
          {/* Overlay */}
          <DialogPrimitive.Overlay className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          
          {/* Content */}
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[110] w-full max-w-[400px] translate-x-[-50%] translate-y-[-50%] rounded-[12px] border border-border-main bg-bg-surface p-6 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden">
            
            {/* Subtle Top Accent Glow for the modal */}
            <div 
              className="absolute top-0 left-0 right-0 h-[2.5px] opacity-90"
              style={{
                background: options?.variant === 'danger' 
                  ? '#ef4444' 
                  : options?.variant === 'warning' 
                  ? '#f59e0b' 
                  : 'var(--accent, #00d4aa)'
              }}
            />

            <div className="flex flex-col gap-5">
              {/* Header/Title block */}
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-[38px] h-[38px] rounded-[9px] flex items-center justify-center shrink-0 border-[0.5px] transition-all"
                )}
                style={{
                  color: options?.variant === 'danger' 
                    ? '#ef4444' 
                    : options?.variant === 'warning' 
                    ? '#f59e0b' 
                    : 'var(--accent, #00d4aa)',
                  borderColor: options?.variant === 'danger'
                    ? '#ef444425'
                    : options?.variant === 'warning'
                    ? '#f59e0b25'
                    : 'var(--accent, #00d4aa25)',
                  backgroundColor: options?.variant === 'danger'
                    ? '#ef44440c'
                    : options?.variant === 'warning'
                    ? '#f59e0b0c'
                    : 'var(--accent, #00d4aa0c)'
                }}>
                  <WarningCircle size={20} weight="bold" />
                </div>
                
                <div className="space-y-1.5 flex-1 min-w-0">
                  <DialogPrimitive.Title className="text-[13px] font-medium text-text-primary uppercase tracking-[0.06em] font-syne leading-tight">
                    {options?.title}
                  </DialogPrimitive.Title>
                  <DialogPrimitive.Description className="text-[10px] text-text-secondary leading-[1.6] uppercase tracking-[0.02em]">
                    {options?.message}
                  </DialogPrimitive.Description>
                </div>
              </div>

              {/* Actions/Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="flex-1 py-3 rounded-[8px] border border-border-main text-text-muted hover:text-text-primary hover:border-border-main/80 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors cursor-pointer bg-transparent outline-none"
                >
                  {options?.cancelText || 'Cancelar'}
                </button>
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className="flex-1 py-3 rounded-[8px] text-[10px] font-medium uppercase tracking-[0.08em] transition-all hover:opacity-90 cursor-pointer shadow-md border-0 outline-none"
                  style={{
                    backgroundColor: options?.variant === 'danger' 
                      ? '#ef4444' 
                      : options?.variant === 'warning' 
                      ? '#f59e0b' 
                      : 'var(--accent, #00d4aa)',
                    color: options?.variant === 'danger' || options?.variant === 'warning' ? '#ffffff' : '#000000'
                  }}
                >
                  {options?.confirmText || 'Confirmar'}
                </button>
              </div>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </ConfirmContext.Provider>
  )
}
