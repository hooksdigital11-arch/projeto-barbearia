import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'scratch/**',
    'Backup/**',
    'artifacts/**',
    'barbearia_insights.html',
    'barbearia_insights.pdf',
    'ts_errors*.txt',
    'fix_pdf_colors.js',
    'patch_pdf_css.js',
    'test-proxy.js',
    'test-rpc.ts',
    'scratch_inspect.ts',
  ]),
])
