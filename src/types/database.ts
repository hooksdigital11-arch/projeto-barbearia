import type { Database as SupabaseDatabase } from './supabase'

export type Database = SupabaseDatabase

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Enums<T extends keyof (Database['public'] extends { Enums: any } ? Database['public']['Enums'] : any)> = Database['public'] extends { Enums: any } ? Database['public']['Enums'][T] : any

// Add custom types/re-exports here
export type Profile = Tables<'profiles'>
export type Appointment = Tables<'appointments'>
