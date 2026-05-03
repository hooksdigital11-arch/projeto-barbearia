export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'barber' | 'client'
          organization_id: string
          created_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'barber' | 'client'
          organization_id: string
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'barber' | 'client'
          organization_id?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          service_id: string
          barber_id: string
          start_time: string
          duration_minutes: number
          status: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          organization_id: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          barber_id: string
          start_time: string
          duration_minutes?: number
          status?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          organization_id: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string
          barber_id?: string
          start_time?: string
          duration_minutes?: number
          status?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          organization_id?: string
          created_at?: string
        }
      }
    }
  }
}
