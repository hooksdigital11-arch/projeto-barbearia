'use client'

import Link from 'next/link'
import { useState } from 'react'
import { List, X, Scissors } from '@phosphor-icons/react'

const navLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Planos', href: '#planos' },
  { label: 'FAQ', href: '#faq' },
]

export function LandingNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute top-0 inset-x-0 z-50 w-full">
      <nav className="max-w-[900px] mx-auto px-6 py-7 flex items-center justify-between">
        <div className="flex items-center gap-[7px]">
          <Scissors size={14} className="text-accent-main" weight="fill" />
          <span className="font-syne text-[12px] font-semibold uppercase tracking-[0.2em] text-white">
            BarberOS
          </span>
        </div>

        <div className="hidden md:flex items-center gap-9">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 hover:text-white/75 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 hover:text-white/70 transition-colors duration-300 px-3 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="font-mono text-[9px] uppercase tracking-[0.16em] bg-accent-main text-black font-medium px-5 py-[9px] rounded-full hover:opacity-90 transition-all duration-300"
          >
            Começar
          </Link>
        </div>

        <button
          className="md:hidden text-white/45 hover:text-white transition-colors duration-300 p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        >
          {open ? <X size={18} /> : <List size={18} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden mx-4 mt-1 bg-black/92 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 flex flex-col gap-5">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55 hover:text-white transition-colors"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-white/[0.07] pt-5 flex flex-col gap-3">
              <Link
                href="/login"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45 hover:text-white transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/signup"
                className="font-mono text-[11px] uppercase tracking-[0.16em] bg-accent-main text-black font-medium px-5 py-3 rounded-full hover:opacity-90 transition-all text-center"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
