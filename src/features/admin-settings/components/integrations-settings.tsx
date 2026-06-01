'use client'

import { useState, useEffect } from 'react'
import { WhatsappLogo, GoogleLogo, InstagramLogo, CreditCard, QrCode, Plug, CircleNotch, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils/cn'
import { getEvolutionStatus, getWhatsappQrCodeAction, disconnectWhatsappAction } from '../actions'
import { toast } from 'sonner'

type WhatsAppState = 'loading' | 'connected' | 'disconnected' | 'not_configured' | 'error'

export function IntegrationsSettings() {
  const [whatsAppState, setWhatsAppState] = useState<WhatsAppState>('loading')
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isGeneratingQr, setIsGeneratingQr] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)

  // 1. Carrega status inicial
  const loadStatus = () => {
    getEvolutionStatus().then(({ state }) => {
      setWhatsAppState(state as WhatsAppState)
    }).catch(() => setWhatsAppState('error'))
  }

  useEffect(() => {
    loadStatus()
  }, [])

  // 2. Busca QR Code
  const fetchQrCode = async () => {
    setIsGeneratingQr(true)
    setQrCodeUrl(null)
    setErrorMessage(null)
    try {
      const res = await getWhatsappQrCodeAction()
      if (res.error) {
        setErrorMessage(res.error)
        toast.error(res.error)
      } else if (res.connected) {
        setWhatsAppState('connected')
        setIsConnectModalOpen(false)
        toast.success('WhatsApp já está conectado!')
      } else if (res.qrcode) {
        setQrCodeUrl(res.qrcode)
      }
    } catch (err) {
      setErrorMessage('Erro ao gerar QR Code.')
    } finally {
      setIsGeneratingQr(false)
    }
  }

  // 3. Polling de status e refresh de QR Code quando o QR Code é exibido
  useEffect(() => {
    let statusIntervalId: NodeJS.Timeout | null = null
    let qrRefreshIntervalId: NodeJS.Timeout | null = null

    if (isConnectModalOpen && qrCodeUrl) {
      // Polling de status da conexão
      statusIntervalId = setInterval(async () => {
        try {
          const { state } = await getEvolutionStatus()
          if (state === 'connected') {
            setWhatsAppState('connected')
            setIsConnectModalOpen(false)
            toast.success('WhatsApp conectado com sucesso!')
            if (statusIntervalId) clearInterval(statusIntervalId)
            if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId)
          }
        } catch (e) {
          console.error('[evolution] Erro no polling de status:', e)
        }
      }, 3000)

      // Atualização silenciosa do QR Code a cada 20 segundos para não expirar
      qrRefreshIntervalId = setInterval(async () => {
        try {
          const res = await getWhatsappQrCodeAction()
          if (res.qrcode) {
            setQrCodeUrl(res.qrcode)
          }
        } catch (err) {
          console.warn('[evolution] Erro silencioso ao atualizar QR Code:', err)
        }
      }, 20000)
    }

    return () => {
      if (statusIntervalId) clearInterval(statusIntervalId)
      if (qrRefreshIntervalId) clearInterval(qrRefreshIntervalId)
    }
  }, [isConnectModalOpen, qrCodeUrl])

  // 4. Conectar
  const handleConnectClick = () => {
    if (whatsAppState === 'not_configured') {
      toast.error('Evolution API não está configurada no servidor.')
      return
    }
    setIsConnectModalOpen(true)
    fetchQrCode()
  }

  // 5. Desconectar
  const handleDisconnect = async () => {
    setIsDisconnecting(true)
    try {
      const res = await disconnectWhatsappAction()
      if (res.error) {
        toast.error(res.error)
      } else {
        setWhatsAppState('disconnected')
        setIsDisconnectModalOpen(false)
        toast.success('Instância desconectada e removida.')
      }
    } catch (err) {
      toast.error('Erro ao desconectar.')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const statusLabel: Record<WhatsAppState, { label: string; color: string }> = {
    loading:        { label: 'Verificando...', color: '#555555' },
    connected:      { label: 'Conectado',      color: '#00c070' },
    disconnected:   { label: 'Desconectado',   color: '#c04040' },
    not_configured: { label: 'Não configurado', color: '#c04040' },
    error:          { label: 'Erro de conexão', color: '#f59e0b' },
  }
  const status = statusLabel[whatsAppState]

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-0.5">
        <h2 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Integrações</h2>
        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/65">Conecte sua barbearia com o ecossistema digital</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* WhatsApp Integration Card */}
        <div className="bg-[#0a1a0f] border-[0.5px] border-accent-main/15 rounded-[10px] p-5 grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-6 sm:gap-4 items-center relative overflow-hidden group">
          {/* Sutil Glow effect */}
          <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[radial-gradient(circle,_var(--accent-05, #00d4aa08),_transparent)] -mr-10 -mt-10 pointer-events-none" />

          {/* Left Side */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-[44px] h-[44px] rounded-[10px] bg-[#128C7E] flex items-center justify-center text-text-primary shrink-0">
                <WhatsappLogo size={22} weight="fill" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[16px] font-medium text-text-primary tracking-[0.02em] leading-[1.2] uppercase">WhatsApp Business</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {whatsAppState === 'loading' ? (
                    <CircleNotch size={10} className="animate-spin" style={{ color: status.color }} />
                  ) : (
                    <div className="w-[5px] h-[5px] rounded-full" style={{ background: status.color }} />
                  )}
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em]" style={{ color: status.color }}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-text-secondary/80 glanced-text leading-[1.6] max-w-[340px]">
              Envie lembretes automáticos, confirmações de agendamento e mensagens de boas-vindas diretamente para seus clientes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {whatsAppState === 'connected' ? (
                <button
                  onClick={() => setIsDisconnectModalOpen(true)}
                  className="flex items-center gap-2 bg-[#1a0f0f] border border-red-500/20 text-red-400 px-5 py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
                >
                  <Plug size={14} weight="bold" />
                  Desconectar WhatsApp
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleConnectClick}
                    disabled={whatsAppState === 'loading'}
                    className="flex items-center gap-2 bg-accent-main text-black px-5 py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Plug size={14} weight="bold" />
                    Conectar Agora
                  </button>
                  
                  {(whatsAppState === 'disconnected' || whatsAppState === 'error') && (
                    <button
                      onClick={() => setIsDisconnectModalOpen(true)}
                      className="flex items-center gap-2 bg-[#1a0f0f] border border-red-500/10 text-red-400/70 px-4 py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-[0.1em] hover:bg-red-500/20 hover:text-red-300 transition-all cursor-pointer"
                      title="Apaga a instância antiga e inicia uma conexão limpa"
                    >
                      Resetar Conexão
                    </button>
                  )}
                </div>
              )}
              <button className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted hover:text-text-primary transition-colors">
                Documentação
              </button>
            </div>
          </div>

          {/* Right Side (QR) */}
          <div className="bg-[#0d1a12] border-[0.5px] border-[#1a2a1a] rounded-[9px] h-[130px] w-full max-w-[280px] sm:max-w-none sm:w-[140px] flex flex-col items-center justify-center gap-2.5 mx-auto sm:mx-0">
            {whatsAppState === 'connected' ? (
              <>
                <div className="w-[7px] h-[7px] rounded-full bg-[#00c070]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#00c070]">Ativo</span>
              </>
            ) : (
              <>
                <QrCode size={36} className="text-[#3c6347]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-[#5c8a6b]">Conecte para ver</span>
              </>
            )}
          </div>
        </div>

        {/* Future Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[10px]">
          {[
            { 
              name: 'Google Calendar', 
              icon: GoogleLogo, 
              bg: 'bg-[#0d2040]', 
              color: 'text-[#4285f4]' 
            },
            { 
              name: 'Instagram', 
              icon: InstagramLogo, 
              bg: 'bg-[#2e0d1e]', 
              color: 'text-[#e1306c]' 
            },
            { 
              name: 'Stripe', 
              icon: CreditCard, 
              bg: 'bg-[#0d1a2e]', 
              color: 'text-[#6772e5]' 
            },
          ].map((item) => (
            <div key={item.name} className="relative bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-[18px_16px] flex flex-col items-center gap-3 opacity-50 group">
              {/* Badge Em Breve */}
              <div className="absolute top-[10px] right-[10px] text-[8px] font-medium uppercase tracking-[0.08em] text-text-muted/70 bg-bg-surface border-[0.5px] border-border-main rounded-[4px] px-[7px] py-[2px]">
                Em breve
              </div>

              <div className={cn(
                "w-[42px] h-[42px] rounded-[10px] flex items-center justify-center transition-all",
                item.bg,
                item.color
              )}>
                <item.icon size={22} weight="bold" />
              </div>

              <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-nav">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connect QR Code Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsConnectModalOpen(false)}
          />
          <div className="relative w-full max-w-[480px] rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between p-[24px] pb-5 border-b-[0.5px] border-border-main">
              <div className="flex items-center gap-4">
                <div className="w-[32px] h-[32px] flex items-center justify-center bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] text-accent-main shrink-0">
                  <WhatsappLogo size={18} weight="fill" />
                </div>
                <div className="space-y-0.5">
                  <h2 className="text-[14px] font-medium text-text-primary uppercase tracking-tight">Conectar WhatsApp</h2>
                  <p className="text-[9px] text-text-muted font-medium uppercase tracking-[0.08em]">Evolution API Integration</p>
                </div>
              </div>
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="w-[26px] h-[26px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[6px] text-[#444] transition-all hover:text-text-primary cursor-pointer"
              >
                <X size={12} weight="regular" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-[24px] py-[24px] custom-scrollbar flex flex-col items-center">
              {isGeneratingQr ? (
                <div className="flex flex-col items-center py-12 space-y-4">
                  <CircleNotch size={32} className="animate-spin text-accent-main" />
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.08em] text-center max-w-[280px]">
                    Iniciando a instância e gerando código QR...
                  </p>
                </div>
              ) : errorMessage ? (
                <div className="flex flex-col items-center py-6 text-center space-y-4 w-full">
                  <div className="w-12 h-12 rounded-full bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-500">
                    <X size={20} weight="bold" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] font-medium text-text-primary uppercase tracking-tight">Falha na Conexão</p>
                    <p className="text-[10px] text-text-muted max-w-[340px] leading-relaxed uppercase break-words">{errorMessage}</p>
                  </div>
                  <button
                    onClick={fetchQrCode}
                    className="px-6 py-2 bg-bg-sidebar border border-border-main rounded-[6px] text-[10px] text-text-primary uppercase tracking-wider hover:border-[#444] transition-all cursor-pointer"
                  >
                    Tentar Novamente
                  </button>
                </div>
              ) : qrCodeUrl ? (
                <div className="w-full flex flex-col items-center space-y-6">
                  {/* QR Code Container */}
                  <div className="p-3 bg-white rounded-[10px] border border-border-main shadow-lg">
                    <div className="relative w-[200px] h-[200px] bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrCodeUrl}
                        alt="WhatsApp QR Code"
                        className="w-full h-full object-contain"
                      />
                      {/* Dynamic Color Overlay - colors the black pixels to theme accent main while keeping white background */}
                      <div className="absolute inset-0 bg-accent-main mix-blend-screen pointer-events-none" />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="w-full space-y-3 bg-bg-sidebar/30 border border-border-main/50 rounded-[8px] p-4">
                    <p className="text-[9px] font-medium text-text-primary uppercase tracking-[0.08em] border-b border-border-main/30 pb-2">
                      Instruções de Conexão:
                    </p>
                    <ol className="list-decimal list-inside text-[11px] text-text-secondary leading-relaxed space-y-1.5 font-light">
                      <li>Abra o <span className="font-medium text-text-primary">WhatsApp</span> no seu celular.</li>
                      <li>Toque em <span className="font-medium text-text-primary">Aparelhos conectados</span> nas Configurações.</li>
                      <li>Selecione <span className="font-medium text-text-primary">Conectar um aparelho</span>.</li>
                      <li>Aponte a câmera para ler o código QR acima.</li>
                    </ol>
                  </div>

                  {/* Connection status/pulse */}
                  <div className="w-full bg-[#0a1a0f]/50 border border-accent-main/10 rounded-[8px] p-3 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent-main animate-pulse shadow-[0_0_10px_#00d4aa]" />
                    <span className="text-[9px] font-medium text-accent-main uppercase tracking-[0.1em]">
                      Aguardando leitura do QR Code...
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {isDisconnectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setIsDisconnectModalOpen(false)}
          />
          <div className="relative w-full max-w-[420px] rounded-[12px] border border-border-main bg-bg-surface overflow-hidden animate-in fade-in zoom-in-95 duration-500 flex flex-col">
            <div className="flex items-center justify-between p-[20px] pb-4 border-b-[0.5px] border-border-main">
              <h3 className="text-[12px] font-medium text-text-primary uppercase tracking-[0.08em]">
                Desconectar WhatsApp
              </h3>
              <button
                onClick={() => setIsDisconnectModalOpen(false)}
                className="w-[24px] h-[24px] flex items-center justify-center bg-[#1a1a1a] border-[0.5px] border-[#252525] rounded-[5px] text-[#444] hover:text-text-primary transition-colors cursor-pointer"
              >
                <X size={10} />
              </button>
            </div>
            
            <div className="p-[20px] space-y-4">
              <p className="text-[11px] text-text-secondary leading-relaxed uppercase">
                Tem certeza que deseja desconectar a instância do WhatsApp? 
                Esta ação interromperá o envio de mensagens automáticas de confirmação, lembretes e disparos em massa.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDisconnectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-[7px] border border-border-main text-text-muted hover:text-text-primary hover:border-[#333] text-[10px] font-medium uppercase tracking-[0.08em] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex-1 py-2.5 rounded-[7px] bg-red-950/20 border border-red-500/30 hover:bg-red-900/30 text-red-400 text-[10px] font-medium uppercase tracking-[0.08em] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isDisconnecting ? (
                    <CircleNotch size={12} className="animate-spin" />
                  ) : (
                    'Desconectar'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

