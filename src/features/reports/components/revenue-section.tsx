'use client'

import { useEffect, useRef, useState } from 'react'
import type { RevenueReport } from '../types'
import { useThemeColors } from '@/lib/hooks/use-theme-colors'

interface RevenueSectionProps {
  data: RevenueReport
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

export function RevenueSection({ data }: RevenueSectionProps) {
  const { kpis, chartData, topServices, topProducts } = data
  const barChartRef = useRef<HTMLCanvasElement>(null)
  const doughnutChartRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { accent: C, secondary: C2 } = useThemeColors()

  const totalServices = topServices.reduce((acc, s) => acc + s.quantity, 0)

  useEffect(() => {
    const checkChart = () => {
      if (window.Chart) setIsLoaded(true)
      else setTimeout(checkChart, 100)
    }
    checkChart()
  }, [])

  useEffect(() => {
    if (!isLoaded || !barChartRef.current || !doughnutChartRef.current) return

    const Chart = window.Chart
    
    const barChart = new Chart(barChartRef.current, {
      type: 'bar',
      data: {
        labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
        datasets: [
          { 
            label: 'Esta semana', 
            data: chartData.map(d => d.revenue), 
            backgroundColor: C, 
            borderColor: C, 
            borderWidth: 0, 
            borderRadius: 4,
            barThickness: 12
          },
          { 
            label: 'Semana anterior', 
            data: chartData.map(d => (d.revenue || 0) * 0.7), 
            backgroundColor: '#2a2a2a', 
            borderColor: '#333', 
            borderWidth: 0, 
            borderRadius: 4,
            barThickness: 12
          }
        ]
      },
      options: {
        ...baseOpts,
        scales: {
          x: { ...baseOpts.scales.x, grid: { display: false } },
          y: { ...baseOpts.scales.y, grid: { color: GRID, borderDash: [2, 2] } }
        }
      }
    })

    const doughnutChart = new Chart(doughnutChartRef.current, {
      type: 'doughnut',
      data: {
        labels: topServices.map(s => s.name.toUpperCase()),
        datasets: [{ 
          data: topServices.map(s => s.quantity), 
          backgroundColor: [C, C2, '#2a2a2a', '#141414', '#0f0f0f'], 
          borderColor: '#111', 
          borderWidth: 2, 
          hoverOffset: 4 
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#141414',
            borderColor: '#2a2a2a',
            borderWidth: 0.5,
            titleColor: '#888',
            bodyColor: '#ccc',
            padding: 8,
            callbacks: { 
              label: (ctx: { parsed: number; label: string }) => {
                const val = ctx.parsed
                const pct = totalServices > 0 ? Math.round((val / totalServices) * 100) : 0
                return ` ${ctx.label}: ${pct}%`
              }
            }
          }
        }
      }
    })

    return () => {
      barChart.destroy()
      doughnutChart.destroy()
    }
  }, [isLoaded, chartData, topServices, totalServices, C, C2])

  return (
    <div className="space-y-4">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Faturamento Total</div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-text-nav font-normal uppercase">R$</span>
            <span className="text-[22px] font-medium text-text-primary uppercase leading-none">{kpis.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="text-[9px] text-accent-main mt-1 tracking-[0.04em]">+{kpis.totalRevenueChange.toFixed(0)}% vs semana anterior</div>
        </div>
        
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Ticket Médio</div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-text-nav font-normal uppercase">R$</span>
            <span className="text-[17px] font-medium text-text-primary uppercase leading-none">{kpis.averageTicket.toFixed(2)}</span>
          </div>
          <div className="text-[9px] text-accent-main mt-1 tracking-[0.04em]">{kpis.totalComandas} atendimentos</div>
        </div>

        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Resgates Fidelidade</div>
          <div className="text-[22px] font-medium text-text-primary leading-none uppercase">4</div>
          <div className="text-[9px] text-[#2a2a2a] mt-1 tracking-[0.04em]">134 resgates total</div>
        </div>

        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Pendente</div>
          <div className="flex items-baseline gap-1">
            <span className="text-[10px] text-text-nav font-normal uppercase">R$</span>
            <span className="text-[17px] font-medium text-text-primary uppercase leading-none">0,00</span>
          </div>
          <div className="text-[9px] text-[#2a2a2a] mt-1 tracking-[0.04em]">Em aberto</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[10px]">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
          <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Faturamento por Dia</div>
          <div className="flex flex-wrap gap-3 mb-2.5">
            <div className="flex items-center gap-[5px] text-[10px] text-[#444] uppercase"><div className="w-2 h-2 rounded-[2px] bg-accent-main" />Esta semana</div>
            <div className="flex items-center gap-[5px] text-[10px] text-[#444] uppercase"><div className="w-2 h-2 rounded-[2px] bg-[#1e1e1e] border-[0.5px] border-[#333]" />Semana anterior</div>
          </div>
          <div className="relative w-full h-[140px]">
            <canvas ref={barChartRef} />
          </div>
        </div>

        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
          <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Distribuição por Serviço</div>
          <div className="flex items-center justify-center gap-5 h-[140px] py-2">
            <div className="relative w-[120px] h-[120px] shrink-0">
              <canvas ref={doughnutChartRef} />
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
              {topServices.slice(0, 3).map((s, i) => {
                const pct = totalServices > 0 ? Math.round((s.quantity / totalServices) * 100) : 0
                return (
                  <div key={i} className="flex items-center gap-[5px] text-[10px] text-[#444] uppercase truncate">
                    <div className="w-2 h-2 rounded-[2px]" style={{ background: [C, C2, '#2a2a2a'][i] }} />
                    {s.name} {pct}%
                  </div>
                )
              })}
              {topServices.length === 0 && (
                <div className="text-[9px] text-[#2a2a2a] uppercase tracking-widest">Sem dados</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
        <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Top Produtos de Revenda</div>
        {topProducts.length > 0 ? topProducts.slice(0, 2).map((prod, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b-[0.5px] border-border-main last:border-0">
            <span className="text-[11px] text-text-muted uppercase">{prod.name}</span>
            <span className="text-[12px] font-medium text-accent-main font-mono">R$ {prod.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )) : (
          <div className="py-4 text-center text-[10px] text-[#2a2a2a] uppercase tracking-widest">Nenhum produto vendido</div>
        )}
      </div>
    </div>
  )
}
