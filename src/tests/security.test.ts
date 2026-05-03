import { describe, it, expect } from 'vitest'
import { sanitizeString, sanitizeEmail } from '@/lib/security/sanitize'
import { validateExternalUrl } from '@/lib/security/ssrf'
import { encryptData, decryptData } from '@/lib/security/crypto'

describe('Security Layer Tests', () => {
  // XSS Protection
  it('should sanitize HTML scripts', () => {
    const input = '<img src=x onerror=alert(1)>'
    const result = sanitizeString(input)
    expect(result).not.toContain('alert')
    expect(result).not.toContain('onerror')
  })
  
  // Email Sanitization
  it('should reject invalid emails', () => {
    expect(() => sanitizeEmail('invalid-email')).toThrow()
  })
  
  // SSRF Protection
  it('should block private IP ranges', () => {
    expect(validateExternalUrl('http://127.0.0.1:3000')).toBe(false)
    expect(validateExternalUrl('http://192.168.1.1')).toBe(false)
    expect(validateExternalUrl('https://google.com')).toBe(true)
  })
  
  // Encryption
  it('should encrypt and decrypt correctly', () => {
    // Note: This requires ENCRYPTION_KEY to be set in the test environment
    // For unit tests, we might need to mock the key if it's missing
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
    const plaintext = 'sensitive barber data'
    const encrypted = encryptData(plaintext)
    const decrypted = decryptData(encrypted)
    expect(decrypted).toBe(plaintext)
  })
})
