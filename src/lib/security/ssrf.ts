import { URL } from 'url'

/**
 * Validates an external URL to prevent Server-Side Request Forgery (SSRF).
 * Blocks private IP ranges and restricts allowed protocols.
 */
export function validateExternalUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    
    // Only allow HTTP and HTTPS
    if (!['http:', 'https:'].includes(url.protocol)) {
      return false
    }
    
    const hostname = url.hostname
    
    // Private IP patterns to block (RFC 1918 and others)
    const privatePatterns = [
      /^localhost$/,
      /^127\..*$/,
      /^10\..*$/,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\..*$/,
      /^192\.168\..*$/,
      /^::1$/,
      /^fc00:/,
    ]
    
    if (privatePatterns.some(pattern => pattern.test(hostname))) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}
