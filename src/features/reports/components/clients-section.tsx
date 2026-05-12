'use client'

import { useEffect, useRef, useState } from 'react'
import type { ClientReport } from '../types'
import { cn } from '@/lib/utils/cn'
import { useThemeColors } from '@/lib/hooks/use-theme-colors'

interface ClientsSectionProps {
  data: ClientReport
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

export function ClientsSection({ data }: ClientsSectionProps) {
  const { kpis, newClientsChart, topClients } = data
  const lineChartRef = useRef<HTMLCanvasElement>(null)
  const retentionChartRef = useRef<HTMLCanvasElement>(null)
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
    if (!isLoaded || !lineChartRef.current || !retentionChartRef.current) return

    const Chart = window.Chart
    
    const lineChart = new Chart(lineChartRef.current, {
      type: 'line',
      data: {
        labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
        datasets: [{ data: newClientsChart.map(d => d.count), borderColor: C, backgroundColor: C + '18', tension: 0.4, fill: true, pointBackgroundColor: C, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2 }]
      },
      options: { ...baseOpts, responsive: true, maintainAspectRatio: false }
    })

    const retentionChart = new Chart(retentionChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Retidos','Perdidos'],
        datasets: [{ data: [kpis.retentionRate, 100 - kpis.retentionRate], backgroundColor: [C2, '#1a1a1a'], borderColor: '#111', borderWidth: 2 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    })

    return () => {
      lineChart.destroy()
      retentionChart.destroy()
    }
  }, [isLoaded, newClientsChart, kpis.retentionRate, C, C2])

  return (
    <div className="space-y-2.5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Total</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.totalActive}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Ativos</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.totalActive}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Novos</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.newClients}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Retenção</div>
          <div className="text-[22px] font-medium text-accent-main leading-none">{kpis.retentionRate.toFixed(0)}%</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
          <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Novos Clientes — Semana</div>
          <div className="relative w-full h-[120px]">
            <canvas ref={lineChartRef} />
          </div>
        </div>

        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
          <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Retenção de Clientes</div>
          <div className="flex items-center justify-center gap-5 py-2">
            <div className="relative w-[110px] h-[110px] shrink-0">
              <canvas ref={retentionChartRef} />
            </div>
            <div>
              <div className="text-[28px] font-medium text-text-primary tracking-[-0.02em]">{kpis.retentionRate.toFixed(0)}%</div>
              <div className="text-[10px] text-[#333] mt-1 uppercase tracking-widest">Clientes retidos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking Table */}
      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
        <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Ranking de Clientes</div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="grid grid-cols-[1.6fr_1fr_60px_80px_80px] gap-2.5 pb-2 border-b-[0.5px] border-border-main mb-0.5">
              <div className="text-[8px] tracking-[0.1em] text-[#2a2a2a] uppercase">Cliente</div>
              <div className="text-[8px] tracking-[0.1em] text-[#2a2a2a] uppercase">Status</div>
              <div className="text-[8px] tracking-[0.1em] text-[#2a2a2a] uppercase">Visitas</div>
              <div className="text-[8px] tracking-[0.1em] text-[#2a2a2a] uppercase text-right">Faturamento</div>
              <div className="text-[8px] tracking-[0.1em] text-[#2a2a2a] uppercase text-right">Última Visita</div>
            </div>
            {topClients.map((c, i) => (
              <div key={i} className="grid grid-cols-[1.6fr_1fr_60px_80px_80px] gap-2.5 py-2.5 items-center border-b-[0.5px] border-border-main last:border-0">
                <div className="text-[10px] text-text-muted font-medium uppercase truncate">{c.name}</div>
                <div className="text-[10px] text-accent-main font-medium uppercase tracking-tight">Ativo</div>
                <div className="text-[10px] text-text-nav uppercase">{c.visits}</div>
                <div className="text-[10px] text-accent-main font-medium uppercase text-right">R$ {c.totalSpent.toLocaleString()}</div>
                <div className="text-[10px] text-text-nav uppercase text-right">{c.lastVisit}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
