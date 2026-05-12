'use client'

import { useEffect, useRef, useState } from 'react'
import type { LoyaltyReport } from '../types'
import { cn } from '@/lib/utils/cn'

interface LoyaltySectionProps {
  data: LoyaltyReport
}

export function LoyaltySection({ data }: LoyaltySectionProps) {
  const { kpis } = data
  const loyaltyChartRef = useRef<HTMLCanvasElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const engagedPercent = Math.min(100, Math.round((kpis.activeMembers / (kpis.activeMembers + 50)) * 100))

  useEffect(() => {
    const checkChart = () => {
      if (window.Chart) setIsLoaded(true)
      else setTimeout(checkChart, 100)
    }
    checkChart()
  }, [])

  useEffect(() => {
    if (!isLoaded || !loyaltyChartRef.current) return

    const Chart = window.Chart
    
    const loyaltyChart = new Chart(loyaltyChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Engajados','Total'],
        datasets: [{ data: [engagedPercent, 100 - engagedPercent], backgroundColor: ['#d4aa00', '#1a1a1a'], borderColor: '#111', borderWidth: 2 }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } }
      }
    })

    return () => {
      loyaltyChart.destroy()
    }
  }, [isLoaded, engagedPercent])

  return (
    <div className="space-y-2.5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">No Programa</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.activeMembers}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Prontos Resgatar</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.readyToRedeem}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Resgates Mês</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">{kpis.redemptions}</div>
        </div>
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[14px_16px]">
          <div className="text-[9px] tracking-[0.1em] text-[#383838] mb-2 uppercase">Progresso Médio</div>
          <div className="text-[22px] font-medium text-text-primary leading-none">0/10</div>
        </div>
      </div>

      <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[16px_18px]">
        <div className="text-[9px] tracking-[0.1em] text-[#2a2a2a] mb-3 uppercase">Engajamento do Programa</div>
        <div className="flex items-center justify-center gap-6 py-3">
          <div className="relative w-[100px] h-[100px] shrink-0">
            <canvas ref={loyaltyChartRef} />
          </div>
          <div>
            <div className="text-[26px] font-medium text-text-primary">{engagedPercent}%</div>
            <div className="text-[10px] text-[#333] mt-1 uppercase tracking-widest">Clientes engajados</div>
            <div className="text-[9px] text-[#2a2a2a] mt-2 max-w-[160px] leading-relaxed">
              Nenhum cliente atingiu a meta de carimbos ainda.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
