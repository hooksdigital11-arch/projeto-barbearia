import { defineConfig } from 'vitest/config'
import path from 'path'
import fs from 'fs'

// Load environment variables from .env.local manually because @next/env ignores it in test mode
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8')
  for (const line of envConfig.split('\n')) {
    const matched = line.trim().match(/^([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (matched) {
      const key = matched[1]
      let value = (matched[2] || '').trim()
      // Remove surrounding quotes if any
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      if (key && !process.env[key]) {
        process.env[key] = value
      }
    }
  }
}

// Fallback for ENCRYPTION_KEY during tests if not defined
if (!process.env.ENCRYPTION_KEY) {
  process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
