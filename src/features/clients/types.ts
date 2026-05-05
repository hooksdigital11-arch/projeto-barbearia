/** Status do cliente */
export type ClientStatus = 'active' | 'inactive' | 'blocked'

/** Cliente com join do barbeiro preferido */
export interface ClientRecord {
  id: string
  organization_id: string
  profile_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  birthday: string | null
  notes: string | null
  preferred_barber_id: string | null
  status: ClientStatus
  total_visits: number
  total_spent_cents: number
  last_visit_at: string | null
  created_at: string
  updated_at: string | null
  preferred_barber: {
    id: string
    full_name: string
  } | null
}

/** Stats para KPI cards */
export interface ClientsStats {
  total: number
  active: number
  newThisMonth: number
  birthdaysThisWeek: number
}

/** Perfil completo do cliente com dados de todas as relações */
export interface ClientProfile extends ClientRecord {
  pastAppointments: AppointmentRecord[]
  upcomingAppointments: AppointmentRecord[]
  stamps: StampRecord[]
  stampBalance: number
  totalSpentCalc: number
  avgTicket: number
}

/** Agendamento com joins */
export interface AppointmentRecord {
  id: string
  start_time: string
  end_time: string | null
  status: string
  price_cents: number | null
  barber: {
    id: string
    full_name: string
  } | null
  service: {
    id: string
    name: string
    duration_minutes: number
  } | null
}

/** Registro de fidelidade */
export interface StampRecord {
  id: string
  type: 'stamp' | 'redeem'
  amount: number
  notes: string | null
  created_at: string
  appointment_id: string | null
}

/** Barbeiro para dropdown */
export interface BarberOption {
  id: string
  full_name: string
}
