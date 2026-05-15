'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { List, X } from '@phosphor-icons/react'
import Link from 'next/link'
import Image from 'next/image'
import { DashboardNav } from './dashboard-nav'
import type { IconName } from './dashboard-nav'
import { LogoutButton } from '@/components/shared/logout-button'
import { cn } from '@/lib/utils/cn'

interface MobileSidebarProps {
  items: Array<{ label: string; href: string; iconName: IconName }>
  orgName: string
  orgLogo?: string | null
  userInitial: string
  userName: string
  userRole: string
  homeHref: string
}

export function MobileSidebar({
  items,
  orgName,
  orgLogo,
  userInitial,
  userName,
  userRole,
  homeHref,
}: MobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 flex items-center justify-center text-accent-main"
        aria-label="Abrir menu"
      >
        <List size={20} weight="regular" />
      </button>

      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={cn(
          'fixed inset-y-0 left-0 z-[70] w-[280px] bg-bg-sidebar border-r-[0.5px] border-border-main flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-[0.5px] border-border-main">
          <Link href={homeHref} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-minimal overflow-hidden flex items-center justify-center bg-white/[0.02] border-[0.5px] border-border-main shrink-0">
              {orgLogo ? (
                <Image src={orgLogo} alt={orgName} width={32} height={32} className="object-cover" />
              ) : (
                <div className="w-full h-full bg-accent-main" />
              )}
            </div>
            <span className="font-syne font-medium text-sm text-text-primary truncate max-w-[150px] uppercase tracking-tight">
              {orgName}
            </span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Fechar menu"
          >
            <X size={18} weight="regular" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <DashboardNav items={items} />
        </div>

        {/* Footer */}
        <div className="border-t-[0.5px] border-border-main p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-[28px] h-[28px] rounded-[7px] bg-surface-secondary flex items-center justify-center text-text-secondary font-medium text-[11px] uppercase shrink-0">
              {userInitial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium truncate text-text-secondary leading-none uppercase">{userName}</p>
              <p className="text-[9px] truncate text-text-muted mt-1 uppercase tracking-[0.06em]">{userRole}</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </>
  )
}
