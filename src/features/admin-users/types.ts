import { Profile } from '@/types/database'

export type AdminUser = Profile & {
  email?: string
  status?: 'active' | 'inactive'
  specialty?: string
}

export type AdminUsersFilter = {
  role?: 'admin' | 'barber' | 'client' | 'all'
  status?: 'active' | 'inactive' | 'all'
  search?: string
}
