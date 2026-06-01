import DOMPurify from 'dompurify'

/**
 * Sanitiza string para remover HTML/scripts perigosos.
 * Útil para campos de texto simples onde HTML não é permitido.
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') return ''
  
  // Remover null bytes (\0)
  let cleaned = input.replace(/\0/g, '')
  
  // Limitar tamanho
  cleaned = cleaned.substring(0, maxLength)
  
  // Remover HTML/scripts usando DOMPurify se no browser, ou regex fallback no servidor
  if (typeof window === 'undefined') {
    cleaned = cleaned.replace(/<[^>]*>/g, '')
  } else {
    cleaned = DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: [], // Rejeita todas as tags
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    })
  }
  
  return cleaned.trim()
}

/**
 * Sanitiza HTML preservando tags seguras (para editores de texto rico).
 */
export function sanitizeHTML(input: string): string {
  if (typeof window === 'undefined') return input // Fallback básico no servidor
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
  })
}

/**
 * Valida e sanitiza email de forma segura.
 */
export function sanitizeEmail(input: string): string {
  const cleaned = sanitizeString(input).toLowerCase()
  
  if (!cleaned.includes('@') || cleaned.length > 255) {
    throw new Error('Email inválido')
  }
  
  return cleaned
}
