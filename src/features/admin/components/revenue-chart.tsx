'use client'

import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'

const data = [
  { name: 'Seg', revenue: 400, lastWeek: 320 },
  { name: 'Ter', revenue: 600, lastWeek: 450 },
  { name: 'Qua', revenue: 550, lastWeek: 600 },
  { name: 'Qui', revenue: 900, lastWeek: 700 },
  { name: 'Sex', revenue: 1200, lastWeek: 950 },
  { name: 'Sáb', revenue: 1500, lastWeek: 1200 },
  { name: 'Dom', revenue: 300, lastWeek: 200 },
]

export default function RevenueChart() {
  return (
    <div className="h-[350px] w-full p-6 rounded-3xl border border-white/5 bg-card/10 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold font-syne text-white">Receita Semanal</h3>
          <p className="text-xs text-text-secondary">Comparação com a semana anterior</p>
        </div>
      </div>

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
          />
          <Area 
            type="monotone" 
            dataKey="lastWeek" 
            stroke="#ffffff40" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="transparent" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
