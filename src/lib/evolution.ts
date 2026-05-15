'server-only'

const EVOLUTION_URL = process.env.EVOLUTION_API_URL
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY
const INSTANCE = process.env.EVOLUTION_INSTANCE

export function isEvolutionConfigured(): boolean {
  return !!(EVOLUTION_URL && EVOLUTION_KEY && INSTANCE)
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: EVOLUTION_KEY!,
  }
}

export async function enviarMensagem(telefone: string, mensagem: string): Promise<void> {
  if (!isEvolutionConfigured()) {
    throw new Error('Evolution API não configurada')
  }
  const numero = telefone.replace(/\D/g, '')
  const response = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ number: `55${numero}`, text: mensagem }),
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Evolution API: ${response.status} ${body}`)
  }
}

export async function verificarConexao() {
  if (!isEvolutionConfigured()) {
    return { state: 'not_configured' }
  }
  const response = await fetch(`${EVOLUTION_URL}/instance/connectionState/${INSTANCE}`, {
    headers: getHeaders(),
  })
  return response.json()
}
