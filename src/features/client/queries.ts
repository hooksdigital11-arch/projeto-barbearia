import 'server-only'
import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'

/**
 * Client Data Access Layer (Mock)
 */

export const getClientDashboardData = cache(async () => {
  const user = await requireUser()
  
  return {
    profile: {
      name: user.full_name || 'Cliente',
      avatar: user.avatar_url,
      preferredBarber: 'Rafael',
      loyaltyStamps: 7, // Mantendo o mock para stamps por enquanto
      nextAppointment: {
        date: '2026-05-05',
        time: '14:00',
        barber: 'Rafael',
        service: 'Corte',
        status: 'confirmed'
      }
    },
    upcomingAppointments: [
      { id: 'u1', date: '05/05', time: '14:00', barber: 'Rafael', service: 'Corte', status: 'confirmed' },
      { id: 'u2', date: '12/05', time: '10:00', barber: 'Rafael', service: 'Barba', status: 'pending' }
    ],
    history: [
      { id: 'h1', date: '28/04', service: 'Corte', barber: 'Rafael', price: 50, duration: '30min', rating: 5 },
      { id: 'h2', date: '21/04', service: 'Barba', barber: 'Thiago', price: 40, duration: '45min', rating: 5 },
      { id: 'h3', date: '14/04', service: 'Corte + Barba', barber: 'Rafael', price: 80, duration: '1h', rating: 5 },
      { id: 'h4', date: '07/04', service: 'Corte', barber: 'Marcos', price: 50, duration: '30min', rating: 4 },
      { id: 'h5', date: '31/03', service: 'Barba', barber: 'Rafael', price: 40, duration: '45min', rating: 5 }
    ],
    availableCoupons: [
      { id: 'cp1', title: '10% OFF Próximo Corte', expiry: '30/05', code: 'NEXT10', discount: '10%' },
      { id: 'cp2', title: 'Pomada Grátis (2+ serviços)', expiry: '15/05', code: 'POMADAFREE', discount: 'BRINDE' }
    ]
  }
})
