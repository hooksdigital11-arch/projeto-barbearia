'use server'

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { Session } from '@supabase/supabase-js'

/**
 * Retrieves the current session with automatic token refresh logic.
 * Uses React cache() to avoid duplicate calls in a single request.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  try {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('[Auth Error]', error.message)
      return null
    }
    
    // Automatic refresh if token expires in less than 5 minutes
    if (session?.expires_at) {
      const expiresIn = session.expires_at * 1000 - Date.now()
      if (expiresIn < 5 * 60 * 1000) {
        const { data: { session: newSession }, error: refreshError } = 
          await supabase.auth.refreshSession()
        
        if (refreshError) {
          console.error('[Refresh Error]', refreshError.message)
          return null
        }
        
        return newSession
      }
    }
    
    return session
  } catch (error) {
    console.error('[Session Error]', error)
    return null
  }
})

/**
 * Helper to ensure a session exists, throwing an error otherwise.
 * Ideal for Server Actions and protected queries.
 */
export async function getSessionOrThrow() {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized - No session found')
  }
  return session
}
