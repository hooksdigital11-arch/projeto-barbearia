'use server'

import pino from 'pino'

/**
 * Configure secure logger with PII masking.
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
  serializers: {
    // Redact sensitive information
    password: () => '[REDACTED]',
    token: () => '[REDACTED]',
    password_hash: () => '[REDACTED]',
    cvv: () => '[REDACTED]',
  },
})

/**
 * Logs a security event with appropriate severity.
 */
export async function logSecurityEvent(
  action: string,
  details: Record<string, any>,
  severity: 'info' | 'warn' | 'error' | 'fatal' = 'warn'
) {
  logger[severity]({
    timestamp: new Date().toISOString(),
    event: action,
    ...details,
  })
}
