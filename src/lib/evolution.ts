import * as Sentry from '@sentry/nextjs'

const TIMEOUT_MS = 8000

function getConfig() {
  const url = process.env.EVOLUTION_API_URL
  const key = process.env.EVOLUTION_API_KEY
  const instance = process.env.EVOLUTION_INSTANCE
  return { url, key, instance }
}

export function isEvolutionConfigured(): boolean {
  const { url, key, instance } = getConfig()
  return !!(url && key && instance)
}

function getHeaders() {
  const { key } = getConfig()
  return {
    'Content-Type': 'application/json',
    apikey: key!,
  }
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

export async function enviarMensagem(telefone: string, mensagem: string): Promise<void> {
  if (!isEvolutionConfigured()) {
    throw new Error('Evolution API não configurada')
  }

  const { url, instance } = getConfig()
  const numero = telefone.replace(/\D/g, '')
  const endpoint = `${url}/message/sendText/${instance}`

  try {
    const response = await fetchWithTimeout(endpoint, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ number: `55${numero}`, text: mensagem }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Evolution API respondeu ${response.status}: ${body}`)
    }

    console.log('[evolution] mensagem enviada', { numero, status: response.status })
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      Sentry.captureException(new Error(`Timeout ao enviar mensagem para ${numero}`))
      throw new Error('Timeout ao enviar mensagem')
    }
    Sentry.captureException(err)
    throw err
  }
}

export async function verificarConexao() {
  if (!isEvolutionConfigured()) {
    return { state: 'not_configured' }
  }

  const { url, instance } = getConfig()

  try {
    const response = await fetchWithTimeout(`${url}/instance/connectionState/${instance}`, {
      method: 'GET',
      headers: getHeaders(),
    })
    return await response.json()
  } catch (err) {
    Sentry.captureException(err)
    return { state: 'error', error: err instanceof Error ? err.message : 'unknown' }
  }
}

export async function criarInstancia(instanceName: string): Promise<void> {
  const { url } = getConfig()
  const response = await fetchWithTimeout(`${url}/instance/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      instanceName,
      qrcode: true,
      integration: 'WHATSAPP-BAILEYS',
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Erro ao criar instância: ${body}`)
  }
}

export async function configurarWebhook(instanceName: string): Promise<void> {
  const { url } = getConfig()
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const webhookSecret = process.env.WEBHOOK_SECRET

  if (!appUrl || !webhookSecret) {
    throw new Error('NEXT_PUBLIC_APP_URL ou WEBHOOK_SECRET não configurados')
  }

  const webhookUrl = `${appUrl}/api/webhook/evolution`

  const response = await fetchWithTimeout(`${url}/webhook/set/${instanceName}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      webhook: {
        enabled: true,
        url: webhookUrl,
        byEvents: true,
        base64: false,
        events: ['MESSAGES_UPSERT', 'MESSAGES_UPDATE', 'CONNECTION_UPDATE'],
        headers: {
          'x-webhook-secret': webhookSecret,
        },
      },
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Erro ao configurar webhook: ${body}`)
  }
}

export async function obterQrCode(instanceName: string): Promise<{ code: string; base64: string }> {
  const { url } = getConfig()
  const response = await fetchWithTimeout(`${url}/instance/connect/${instanceName}`, {
    method: 'GET',
    headers: getHeaders(),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Erro ao obter QR Code: ${body}`)
  }

  return response.json()
}

export async function desconectarInstancia(instanceName: string): Promise<void> {
  const { url } = getConfig()
  
  try {
    await fetchWithTimeout(`${url}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
  } catch (err) {
    console.warn('[evolution] logout falhou, prosseguindo com exclusão', err)
  }

  const response = await fetchWithTimeout(`${url}/instance/delete/${instanceName}`, {
    method: 'DELETE',
    headers: getHeaders(),
  })

  if (!response.ok && response.status !== 404) {
    const body = await response.text()
    throw new Error(`Erro ao deletar instância: ${body}`)
  }
}