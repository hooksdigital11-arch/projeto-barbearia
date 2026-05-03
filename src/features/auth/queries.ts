'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'

/**
 * Hook-like server function to get the current session user.
 * Cached to avoid redundant database calls in a single request.
 */
export const getSessionUser = cache(async () => {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) return null
    return user
  } catch {
    return null
  }
})
