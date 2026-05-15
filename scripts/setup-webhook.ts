/**
 * Run once after deploy to register the Evolution API webhook.
 * Usage: npx ts-node scripts/setup-webhook.ts
 */

const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE
const APP_URL = process.env.NEXT_PUBLIC_APP_URL

if (!EVOLUTION_URL || !EVOLUTION_KEY || !INSTANCE || !APP_URL) {
  console.error('Variáveis obrigatórias ausentes: EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE, NEXT_PUBLIC_APP_URL')
  process.exit(1)
}

async function main() {
  const webhookUrl = `${APP_URL}/api/webhook/evolution`

  console.log(`Registrando webhook em ${webhookUrl} para instância ${INSTANCE}...`)

  const response = await fetch(`${EVOLUTION_URL}/webhook/set/${INSTANCE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: EVOLUTION_KEY!,
    },
    body: JSON.stringify({
      url: webhookUrl,
      webhook_by_events: true,
      webhook_base64: false,
      events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE'],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Erro ao registrar webhook:', data)
    process.exit(1)
  }

  console.log('Webhook registrado com sucesso:', data)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
