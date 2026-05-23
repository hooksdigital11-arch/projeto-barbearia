'use client'

import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

interface ChartDataPoint {
  name: string
  revenue: number
  lastWeek?: number
}

interface RevenueChartProps {
  data?: ChartDataPoint[]
}

export default function RevenueChart({ data = [] }: RevenueChartProps) {
  return (
    <div className="flex flex-col h-[350px] w-full p-6 rounded-3xl border border-white/5 bg-card/10 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h3 className="text-xl font-bold font-syne text-text-primary">Receita Semanal</h3>
          <p className="text-xs text-text-secondary">Comparação com a semana anterior</p>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a0a0a0', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#a0a0a0', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#141414', 
                border: '1px solid #ffffff10', 
                borderRadius: '16px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#00e5ff' }}
              cursor={{ stroke: '#00e5ff', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#00e5ff" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
              animationDuration={1500}
            />
            {data[0]?.lastWeek !== undefined && (
              <Area 
                type="monotone" 
                dataKey="lastWeek" 
                stroke="#ffffff40" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
