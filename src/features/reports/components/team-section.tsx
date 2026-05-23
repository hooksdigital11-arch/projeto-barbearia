'use client'

import { useEffect, useRef, useState } from 'react'
import type { TeamReport } from '../types'
import { useThemeColors } from '@/lib/hooks/use-theme-colors'

interface TeamSectionProps {
  data: TeamReport
}

const GRID = '#1a1a1a'
const TICK = '#333'

const baseOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#141414',
      borderColor: '#2a2a2a',
      borderWidth: 0.5,
      titleColor: '#888',
      bodyColor: '#ccc',
      padding: 8
    }
  },
  scales: {
    x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
    y: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } }, beginAtZero: true }
  }
}

export function TeamSection({ data }: TeamSectionProps) {
  const { barbers, weeklyEvolution, revenueComparison } = data
  const atendimentosChartRef = useRef<HTMLCanvasElement>(null)
  const faturamentoChartRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { accent: C, secondary: C2 } = useThemeColors()

  useEffect(() => {
    const checkChart = () => {
      if (window.Chart) setIsLoaded(true)
      else setTimeout(checkChart, 100)
    }
    checkChart()
  }, [])

  useEffect(() => {
    if (!isLoaded || !atendimentosChartRef.current || !faturamentoChartRef.current) return

    const Chart = window.Chart
    
    const atendimentosChart = new Chart(atendimentosChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Sex','Sáb','Dom'],
        datasets: [{ label: 'João Vitor', data: [1,1,2], backgroundColor: C2 + 'aa', borderColor: C2, borderWidth: 1, borderRadius: 4 }]
      },
      options: {
        ...baseOpts,
        scales: {
          x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
          y: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 }, stepSize: 1 }, beginAtZero: true }
        }
      }
    })

    const faturamentoChart = new Chart(faturamentoChartRef.current, {
      type: 'bar',
      data: {
        labels: revenueComparison.map(r => r.name),
        datasets: [{ data: revenueComparison.map(r => r.revenue), backgroundColor: C + '99', borderColor: C, borderWidth: 1, borderRadius: 4 }]
      },
      options: {
        ...baseOpts,
        indexAxis: 'y',
        scales: {
          x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 }, callback: (v: string | number) => 'R$' + v } },
          y: { grid: { display: false }, ticks: { color: TICK, font: { size: 10 } } }
        }
      }
    })

    return () => {
      atendimentosChart.destroy()
      faturamentoChart.destroy()
    }
  }, [isLoaded, weeklyEvolution, revenueComparison, C, C2])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
      {barbers.map((barber) => (
        <div key={barber.id} className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-4">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-[8px] bg-[#5c35a0] flex items-center justify-center text-[13px] font-medium text-text-primary shrink-0">
              {barber.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="text-[13px] font-medium text-text-secondary leading-tight">{barber.name}</div>
              <div className="text-[10px] text-[#d4aa00] mt-0.5">★ ★ ★ ★ ★ 5.0</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-bg-surface rounded-[6px] p-[8px_10px]">
              <div className="text-[8px] tracking-[0.1em] text-[#2e2e2e] mb-1 uppercase">Atendimentos</div>
              <div className="text-[14px] font-medium text-text-secondary">{barber.appointments}</div>
            </div>
            <div className="bg-bg-surface rounded-[6px] p-[8px_10px]">
              <div className="text-[8px] tracking-[0.1em] text-[#2e2e2e] mb-1 uppercase">Faturamento</div>
              <div className="text-[14px] font-medium text-text-secondary uppercase"><sup className="text-[9px] text-text-nav align-super mr-0.5">R$</sup>{barber.revenue.toLocaleString()}</div>
            </div>
          </div>
          <div className="inline-flex items-center gap-1 text-[9px] text-accent-main tracking-[0.06em] mt-2.5">
            <div className="w-1 h-1 rounded-full bg-accent-main" />
            ATIVO
          </div>
        </div>
      ))}

      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
        <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Atendimentos por Dia</div>
        <div className="relative w-full h-[110px]">
          <canvas ref={atendimentosChartRef} />
        </div>
      </div>

      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
        <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Faturamento por Barbeiro</div>
        <div className="relative w-full h-[110px]">
          <canvas ref={faturamentoChartRef} />
        </div>
      </div>
    </div>
  )
}
