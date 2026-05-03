import crypto from 'crypto'
import { env } from '@/env/server'

const ALGORITHM = 'aes-256-gcm'

/**
 * Retrieves the encryption key from environment variables.
 * Key must be 32 bytes (64 hex characters).
 */
function getKey(): Buffer {
  if (!env.ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY não configurada no ambiente.')
  }
  
  // Espera-se que a chave esteja em formato HEX no .env
  return Buffer.from(env.ENCRYPTION_KEY, 'hex')
}

/**
 * Encrypts sensitive data using AES-256-GCM.
 * Returns a string in format: iv:authTag:encryptedData
 */
export function encryptData(plaintext: string): string {
  const key = getKey()
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypts data previously encrypted with encryptData.
 */
export function decryptData(ciphertext: string): string {
  const key = getKey()
  const [ivHex, authTagHex, encrypted] = ciphertext.split(':')
  
  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Formato de dado criptografado inválido.')
  }
  
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}
