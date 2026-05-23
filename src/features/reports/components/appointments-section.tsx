'use client'

import { useEffect, useRef, useState } from 'react'
import type { AppointmentReport } from '../types'
import { useThemeColors } from '@/lib/hooks/use-theme-colors'

interface AppointmentsSectionProps {
  data: AppointmentReport
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

export function AppointmentsSection({ data }: AppointmentsSectionProps) {
  const { kpis, peakHours } = data
  const completionChartRef = useRef<HTMLCanvasElement>(null)
  const hourChartRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { accent: C } = useThemeColors()

  useEffect(() => {
    const checkChart = () => {
      if (window.Chart) setIsLoaded(true)
      else setTimeout(checkChart, 100)
    }
    checkChart()
  }, [])

  useEffect(() => {
    if (!isLoaded || !completionChartRef.current || !hourChartRef.current) return

    const Chart = window.Chart
    
    const completionChart = new Chart(completionChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Concluídos','Restante'],
        datasets: [{ data: [kpis.completionRate, 100 - kpis.completionRate], backgroundColor: [C, '#1a1a1a'], borderColor: '#111', borderWidth: 2 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    })

    const hourChart = new Chart(hourChartRef.current, {
      type: 'bar',
      data: {
        labels: peakHours.map(h => `${h.hour}h`),
        datasets: [{ data: peakHours.map(h => h.count), backgroundColor: C + '88', borderColor: C, borderWidth: 1, borderRadius: 4 }]
      },
      options: {
        ...baseOpts,
        scales: {
          x: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 } } },
          y: { grid: { color: GRID }, ticks: { color: TICK, font: { size: 10 }, stepSize: 1 }, beginAtZero: true, max: 3 }
        }
      }
    })

    return () => {
      completionChart.destroy()
      hourChart.destroy()
    }
  }, [isLoaded, kpis.completionRate, peakHours, C])

  return (
    <div className="space-y-2.5">
      {/* Metrics Row (5 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Total</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.total}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Confirmados</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.completed}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Cancelados</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.cancelled}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">No Show</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.noShow}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Conclusão</div>
          <div className="text-[22px] font-medium text-accent-main leading-none">{kpis.completionRate.toFixed(0)}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
          <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Taxa de Conclusão</div>
          <div className="flex items-center justify-center gap-5 py-2">
            <div className="relative w-[110px] h-[110px] shrink-0">
              <canvas ref={completionChartRef} />
            </div>
            <div>
              <div className="text-[28px] font-medium text-text-primary tracking-[-0.02em]">{kpis.completionRate.toFixed(0)}%</div>
              <div className="text-[10px] text-[#333] mt-1 uppercase">{kpis.completed} de {kpis.total} atendimentos</div>
            </div>
          </div>
        </div>

        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
          <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Volume por Horário</div>
          <div className="relative w-full h-[120px]">
            <canvas ref={hourChartRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
