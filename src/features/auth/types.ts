export type AuthResponse = {
  error?: string
  success?: boolean
  issues?: Record<string, string[]>
  message?: string
}
