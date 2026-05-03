import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { headers } from 'next/headers'

// Inicia Redis apenas se as variáveis estiverem presentes (evita erro em build)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null

/**
 * Rate limiter por IP (Login)
 * 5 tentativas por 15 minutos
 */
const loginLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
}) : null

/**
 * Rate limiter por User ID (Geral API)
 * 100 requisições por minuto
 */
const apiLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:api',
}) : null

/**
 * Rate limiter por Email (Recuperação de Senha)
 * 2 requisições por hora
 */
const passwordResetLimiter = redis ? new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(2, '1 h'),
  analytics: true,
  prefix: 'ratelimit:password-reset',
}) : null

export async function getClientIp(): Promise<string> {
  const headersList = await headers()
  return (
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown'
  )
}

export async function checkLoginLimit(ip: string) {
  if (!loginLimiter) return { remaining: 1, limit: 1 }
  
  const { success, limit, reset, remaining } = await loginLimiter.limit(ip)
  
  if (!success) {
    throw new Error(
      `Muitas tentativas. Tente novamente em ${Math.ceil((reset - Date.now()) / 1000)} segundos.`
    )
  }
  
  return { remaining, limit }
}

export async function checkApiLimit(userId: string) {
  if (!apiLimiter) return { remaining: 1 }
  
  const { success, remaining } = await apiLimiter.limit(userId)
  
  if (!success) {
    throw new Error('Limite de requisições excedido. Por favor, aguarde um minuto.')
  }
  
  return { remaining }
}

export async function checkPasswordResetLimit(email: string) {
  if (!passwordResetLimiter) return
  
  const { success } = await passwordResetLimiter.limit(email)
  
  if (!success) {
    throw new Error('Muitos pedidos de recuperação. Tente novamente mais tarde.')
  }
}
