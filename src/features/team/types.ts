export interface TeamMember {
  id: string
  organization_id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: string
  status: string | null
  specialty: string | null
  avatar_url: string | null
  created_at: string
}

export interface TeamMemberWithStats extends TeamMember {
  todayAppointments: number
  monthRevenue: number
  avgRating: number
  totalCompleted: number
}

export interface TeamStats {
  total: number
  active: number
  todayAppointments: number
  avgRating: number
}

export interface BarberPerformance {
  total: number
  completed: number
  completionRate: number
  revenue: number
  avgRating: number
}

export interface ScheduleItem {
  id: string
  start_time: string
  end_time: string | null
  status: string
  client_name: string | null
  service_name: string | null
}
