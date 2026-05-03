import { headers } from 'next/headers'

/**
 * Verifies the Origin and Referer headers to prevent CSRF attacks.
 * Ideal for sensitive Server Actions that mutation state.
 */
export async function verifyCsrfOrigin() {
  const headersList = await headers()
  const origin = headersList.get('origin')
  const referer = headersList.get('referer')
  
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    'http://localhost:3000',
  ].filter(Boolean) as string[]
  
  // Validar Origin
  if (origin && !allowedOrigins.includes(origin)) {
    throw new Error(`CSRF Protection: Invalid origin - ${origin}`)
  }
  
  // Validar Referer
  if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    throw new Error(`CSRF Protection: Invalid referer - ${referer}`)
  }
}
