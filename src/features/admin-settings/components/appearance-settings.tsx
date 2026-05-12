'use client'

import { useState, useEffect, useCallback } from 'react'
import { Palette, Moon, MoonStars, Sun, Circle, FloppyDisk, CircleNotch, ArrowCounterClockwise, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { toast } from 'sonner'

// ---------------------
// Types & Constants
// ---------------------
interface ThemePalette {
  label: string
  accent: string
  secondary: string
}

type ModeValue = 'dark' | 'darker' | 'amoled'
type ModeIcon = 'moon' | 'moon-stars' | 'circle'

interface ThemeMode {
  label: string
  value: ModeValue
  icon: ModeIcon
  bg: string
  surface: string
  sidebar: string
  surfaceSecondary: string
  navHover: string
  border: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  textNav: string
  foreground: string
}

const PRESETS: ThemePalette[] = [
  { label: 'PADRÃO',  accent: '#00d4aa', secondary: '#5c35a0' },
  { label: 'OCEANO',  accent: '#6b9fff', secondary: '#e1306c' },
  { label: 'FOGO',    accent: '#f59e0b', secondary: '#ef4444' },
  { label: 'AURORA',  accent: '#a78bfa', secondary: '#ec4899' },
  { label: 'NEON',    accent: '#34d399', secondary: '#3b82f6' },
  { label: 'DOURADO', accent: '#fbbf24', secondary: '#8b5cf6' },
]

const DARK_MODES: ThemeMode[] = [
  { label: 'ESCURO',       value: 'dark',   icon: 'moon',       bg: '#0a0a0a', surface: '#111111', sidebar: '#0f0f0f', surfaceSecondary: '#161616', navHover: '#161616', border: '#1e1e1e', textPrimary: '#ffffff', textSecondary: '#444444', textMuted: '#333333', textNav: '#555555', foreground: '#ffffff' },
  { label: 'MAIS ESCURO',  value: 'darker', icon: 'moon-stars', bg: '#050505', surface: '#0a0a0a', sidebar: '#080808', surfaceSecondary: '#121212', navHover: '#121212', border: '#161616', textPrimary: '#ffffff', textSecondary: '#3a3a3a', textMuted: '#2a2a2a', textNav: '#4a4a4a', foreground: '#ffffff' },
  { label: 'AMOLED',       value: 'amoled', icon: 'circle',     bg: '#000000', surface: '#080808', sidebar: '#000000', surfaceSecondary: '#101010', navHover: '#101010', border: '#111111', textPrimary: '#ffffff', textSecondary: '#333333', textMuted: '#222222', textNav: '#444444', foreground: '#ffffff' },
]

const ALL_MODES: ThemeMode[] = [...DARK_MODES]

const STORAGE_KEY = 'barbershop_theme'
const DEFAULT_ACCENT = '#00d4aa'
const DEFAULT_SECONDARY = '#5c35a0'

// ---------------------
// Helpers
// ---------------------
function hexToRgb(hex: string) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.substring(0, 2), 16) / 255,
    g: parseInt(h.substring(2, 4), 16) / 255,
    b: parseInt(h.substring(4, 6), 16) / 255,
  }
}

function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function isValidHex(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

// ---------------------
// Component
// ---------------------
export function AppearanceSettings() {
  const [accent, setAccent] = useState(DEFAULT_ACCENT)
  const [secondary, setSecondary] = useState(DEFAULT_SECONDARY)
  const [mode, setMode] = useState<ModeValue>('dark')
  const [isSaving, setIsSaving] = useState(false)
  const [accentInput, setAccentInput] = useState(DEFAULT_ACCENT)
  const [secondaryInput, setSecondaryInput] = useState(DEFAULT_SECONDARY)

  // Load saved theme
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.accent && isValidHex(parsed.accent)) {
          setAccent(parsed.accent)
          setAccentInput(parsed.accent)
        }
        if (parsed.secondary && isValidHex(parsed.secondary)) {
          setSecondary(parsed.secondary)
          setSecondaryInput(parsed.secondary)
        }
        if (parsed.mode) setMode(parsed.mode)
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  // Apply CSS variables live
  const applyTheme = useCallback((a: string, s: string) => {
    document.documentElement.style.setProperty('--accent', a)
    document.documentElement.style.setProperty('--secondary', s)
    // Also update the Tailwind theme token
    document.documentElement.style.setProperty('--color-accent-main', a)
    document.documentElement.style.setProperty('--accent-main', a)
  }, [])

  // Apply background mode live
  const applyMode = useCallback((m: ModeValue) => {
    const modeConfig = ALL_MODES.find(x => x.value === m)
    if (!modeConfig) return
    const el = document.documentElement
    el.style.setProperty('--background', modeConfig.bg)
    el.style.setProperty('--foreground', modeConfig.foreground)
    el.style.setProperty('--color-bg-black', modeConfig.bg)
    el.style.setProperty('--color-bg-surface', modeConfig.surface)
    el.style.setProperty('--color-bg-sidebar', modeConfig.sidebar)
    el.style.setProperty('--color-surface-secondary', modeConfig.surfaceSecondary)
    el.style.setProperty('--color-nav-hover', modeConfig.navHover)
    el.style.setProperty('--color-border-main', modeConfig.border)
    el.style.setProperty('--color-text-primary', modeConfig.textPrimary)
    el.style.setProperty('--color-text-secondary', modeConfig.textSecondary)
    el.style.setProperty('--color-text-muted', modeConfig.textMuted)
    el.style.setProperty('--color-text-nav', modeConfig.textNav)
    el.style.setProperty('--border-main', modeConfig.border)
    el.style.setProperty('--surface-main', modeConfig.surface)
    document.body.style.backgroundColor = modeConfig.bg
  }, [])

  useEffect(() => {
    applyTheme(accent, secondary)
  }, [accent, secondary, applyTheme])

  useEffect(() => {
    applyMode(mode)
  }, [mode, applyMode])

  // ---- Preset selection ----
  const selectPreset = (p: ThemePalette) => {
    setAccent(p.accent)
    setSecondary(p.secondary)
    setAccentInput(p.accent)
    setSecondaryInput(p.secondary)
  }

  // ---- Custom color handlers ----
  const handleAccentChange = (value: string) => {
    setAccentInput(value)
    if (isValidHex(value)) setAccent(value)
  }

  const handleSecondaryChange = (value: string) => {
    setSecondaryInput(value)
    if (isValidHex(value)) setSecondary(value)
  }

  // ---- Save ----
  const handleSave = () => {
    setIsSaving(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ accent, secondary, mode }))
      toast.success('Aparência salva com sucesso!')
    } catch {
      toast.error('Erro ao salvar aparência.')
    } finally {
      setTimeout(() => setIsSaving(false), 600)
    }
  }

  // ---- Restore defaults ----
  const handleRestore = () => {
    setAccent(DEFAULT_ACCENT)
    setSecondary(DEFAULT_SECONDARY)
    setAccentInput(DEFAULT_ACCENT)
    setSecondaryInput(DEFAULT_SECONDARY)
    setMode('dark')
    // Reset all CSS tokens to dark defaults
    const darkMode = DARK_MODES[0]
    if (darkMode) {
      const el = document.documentElement
      el.style.setProperty('--background', darkMode.bg)
      el.style.setProperty('--foreground', darkMode.foreground)
      el.style.setProperty('--color-bg-black', darkMode.bg)
      el.style.setProperty('--color-bg-surface', darkMode.surface)
      el.style.setProperty('--color-bg-sidebar', darkMode.sidebar)
      el.style.setProperty('--color-surface-secondary', darkMode.surfaceSecondary)
      el.style.setProperty('--color-nav-hover', darkMode.navHover)
      el.style.setProperty('--color-border-main', darkMode.border)
      el.style.setProperty('--color-text-primary', darkMode.textPrimary)
      el.style.setProperty('--color-text-secondary', darkMode.textSecondary)
      el.style.setProperty('--color-text-muted', darkMode.textMuted)
      el.style.setProperty('--color-text-nav', darkMode.textNav)
      el.style.setProperty('--border-main', darkMode.border)
      el.style.setProperty('--surface-main', darkMode.surface)
      document.body.style.backgroundColor = darkMode.bg
    }
    localStorage.removeItem(STORAGE_KEY)
    toast.success('Aparência restaurada ao padrão.')
  }

  // ---- Contrast check ----
  const accentLuminance = relativeLuminance(accent)
  const contrastOk = accentLuminance >= 0.2

  // Active preset detection
  const activePreset = PRESETS.find(p => p.accent === accent && p.secondary === secondary)

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Header */}
      <div className="space-y-0.5">
        <h2 className="text-[15px] font-medium text-text-primary uppercase tracking-[0.02em]">Aparência</h2>
        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#2a2a2a]">Personalize as cores e o visual do seu painel</p>
      </div>

      {/* Section 1 — Paletas Prontas */}
      <div className="space-y-3">
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Paletas Prontas</span>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {PRESETS.map((p) => {
            const isActive = p.accent === accent && p.secondary === secondary
            return (
              <button
                key={p.label}
                onClick={() => selectPreset(p)}
                className="flex flex-col items-center gap-2 group"
              >
                <div
                  className={cn(
                    "w-[36px] h-[36px] rounded-[10px] border-2 transition-all duration-200",
                    isActive
                      ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                      : "border-transparent group-hover:border-[#333]"
                  )}
                  style={{
                    background: `linear-gradient(135deg, ${p.accent}, ${p.secondary})`,
                  }}
                />
                <span className={cn(
                  "text-[8px] font-medium uppercase tracking-[0.08em] transition-colors",
                  isActive ? "text-text-primary" : "text-[#333]"
                )}>
                  {p.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Section 2 — Custom Colors */}
      <div className="space-y-3">
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Cores Personalizadas</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[14px]">
          {/* Accent */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Cor Primária (Accent)</label>
            <div className="flex items-center gap-[10px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[10px_14px]">
              <div className="relative shrink-0">
                <div
                  className="w-[22px] h-[22px] rounded-[6px] cursor-pointer border-[0.5px] border-white/10"
                  style={{ background: accent }}
                />
                <input
                  type="color"
                  value={accent}
                  onChange={(e) => handleAccentChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <input
                type="text"
                value={accentInput}
                onChange={(e) => handleAccentChange(e.target.value)}
                maxLength={7}
                className="bg-transparent border-none outline-none text-[12px] text-text-secondary font-mono flex-1 w-full"
                placeholder="#000000"
              />
            </div>
          </div>

          {/* Secondary */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Cor Secundária</label>
            <div className="flex items-center gap-[10px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[10px_14px]">
              <div className="relative shrink-0">
                <div
                  className="w-[22px] h-[22px] rounded-[6px] cursor-pointer border-[0.5px] border-white/10"
                  style={{ background: secondary }}
                />
                <input
                  type="color"
                  value={secondary}
                  onChange={(e) => handleSecondaryChange(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
              <input
                type="text"
                value={secondaryInput}
                onChange={(e) => handleSecondaryChange(e.target.value)}
                maxLength={7}
                className="bg-transparent border-none outline-none text-[12px] text-text-secondary font-mono flex-1 w-full"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Live Preview */}
      <div className="space-y-3">
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Preview em Tempo Real</span>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Primary Button */}
            <div
              className="px-4 py-2 rounded-[7px] text-[10px] font-medium uppercase tracking-wider text-black"
              style={{ background: accent }}
            >
              Botão Primário
            </div>

            {/* Outline Button */}
            <div
              className="px-4 py-2 rounded-[7px] text-[10px] font-medium uppercase tracking-wider border-[0.5px]"
              style={{ borderColor: accent, color: accent }}
            >
              Botão Outline
            </div>

            {/* Status Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-medium uppercase tracking-wider"
              style={{ background: `${accent}15`, color: accent, border: `0.5px solid ${accent}33` }}
            >
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: accent }} />
              Ativo
            </div>

            {/* Monetary Value */}
            <div className="flex items-center gap-1.5">
              <div className="w-[6px] h-[6px] rounded-full" style={{ background: accent }} />
              <span className="text-[13px] font-medium text-text-primary font-mono">R$ 1.250</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#383838] uppercase tracking-wider">Progresso</span>
              <span className="text-[9px] font-mono" style={{ color: accent }}>68%</span>
            </div>
            <div className="w-full h-[4px] bg-[#1a1a1a] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: '68%', background: `linear-gradient(90deg, ${accent}, ${secondary})` }}
              />
            </div>
          </div>

          {/* Nav Item + Mini Donut */}
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 px-4 py-2 rounded-[8px] bg-bg-surface text-[10px] font-medium uppercase tracking-wider text-text-primary"
              style={{ borderLeft: `2px solid ${accent}` }}
            >
              Item de Navegação Ativo
            </div>

            {/* Mini Donut */}
            <div className="relative w-[40px] h-[40px]">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1a1a1a" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="88" strokeDashoffset="30"
                  style={{ stroke: secondary }}
                />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="88" strokeDashoffset="60"
                  style={{ stroke: accent }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Contrast Check */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-2.5 rounded-[7px] border-[0.5px]",
          contrastOk
            ? "bg-[#0d2e1a] border-[#00c07033] text-[#00c070]"
            : "bg-[#2e1a0d] border-[#c0700033] text-[#c07000]"
        )}>
          {contrastOk ? <CheckCircle size={14} weight="bold" /> : <WarningCircle size={14} weight="bold" />}
          <span className="text-[10px] font-medium uppercase tracking-wider">
            {contrastOk ? 'Contraste adequado para leitura' : 'Cor muito escura — pode dificultar a leitura'}
          </span>
        </div>
      </div>

      {/* Section 4 — Interface Mode */}
      <div className="space-y-4">
        <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Modo de Interface</span>

        <div className="grid grid-cols-3 gap-[10px]">
          {DARK_MODES.map((m) => {
            const isActive = mode === m.value
            return (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-[9px] border-[0.5px] p-[14px_10px] transition-all cursor-pointer",
                  isActive ? "bg-bg-surface" : "bg-bg-sidebar"
                )}
                style={{
                  borderColor: isActive ? accent : 'var(--color-border-main)',
                }}
              >
                {m.icon === 'moon' && (
                  <Moon size={20} weight={isActive ? "fill" : "regular"} style={{ color: isActive ? accent : 'var(--color-text-nav)' }} />
                )}
                {m.icon === 'moon-stars' && (
                  <MoonStars size={20} weight={isActive ? "fill" : "regular"} style={{ color: isActive ? accent : 'var(--color-text-nav)' }} />
                )}
                {m.icon === 'circle' && (
                  <Circle size={20} weight="fill" style={{ color: isActive ? accent : 'var(--color-text-nav)' }} />
                )}
                <span
                  className="text-[9px] font-medium uppercase tracking-[0.08em] transition-colors"
                  style={{ color: isActive ? 'var(--color-text-secondary)' : 'var(--color-text-nav)' }}
                >
                  {m.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t-[0.5px] border-border-main/50 flex items-center justify-between">
        <button
          onClick={handleRestore}
          className="text-[10px] font-medium uppercase tracking-wider text-[#2e2e2e] hover:text-text-nav transition-colors flex items-center gap-2"
        >
          <ArrowCounterClockwise size={14} />
          Restaurar Padrão
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 text-black px-[18px] py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
          style={{ background: accent }}
        >
          {isSaving ? (
            <CircleNotch size={14} className="animate-spin" />
          ) : (
            <FloppyDisk size={14} weight="bold" />
          )}
          Salvar Aparência
        </button>
      </div>
    </div>
  )
}
