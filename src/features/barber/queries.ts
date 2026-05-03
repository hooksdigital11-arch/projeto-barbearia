import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'

/**
 * Barber Data Access Layer (Mock)
 */

export const getBarberDashboardData = cache(async () => {
  const user = await requireUser()
  
  return {
    status: 'Em atendimento',
    shift: '09:00 - 18:00',
    stats: {
      revenueDay: 1050,
      appointmentsCompleted: 3,
      appointmentsCurrent: 1
    },
    currentClient: {
      id: 'c1',
      name: 'Maria Santos',
      avatar: null,
      visits: 8,
      totalSpent: 480,
      rating: 4.9,
      lastNote: 'Prefere barba curta',
      todayService: 'Barba + Limpeza',
      startTime: '09:45',
      elapsedMinutes: 31
    },
    appointments: [
      { id: 'a1', time: '09:00', duration: '30min', client: 'João Silva', service: 'Corte', status: 'completed' },
      { id: 'a2', time: '09:45', duration: '45min', client: 'Maria Santos', service: 'Barba', status: 'in_progress' },
      { id: 'a3', time: '10:45', duration: '30min', client: 'Pedro Costa', service: 'Corte', status: 'next' },
      { id: 'a4', time: '11:30', duration: '1h', client: 'Ana Costa', service: 'Corte + Barba', status: 'scheduled' }
    ],
    waitingList: [
      { id: 'w1', name: 'Lucas', service: 'Corte', waitingTime: '2min' },
      { id: 'w2', name: 'Carlos', service: 'Barba', waitingTime: '5min' }
    ]
  }
})
