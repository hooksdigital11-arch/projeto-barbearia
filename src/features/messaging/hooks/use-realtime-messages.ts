'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '../types'

/**
 * Hook que escuta novas mensagens em tempo real via Supabase Realtime.
 * Quando uma mensagem é inserida na tabela `messages` para o clientId atual,
 * ela é adicionada ao estado sem precisar recarregar a página.
 */
export function useRealtimeMessages(
  clientId: string | null,
  onNewMessage: (msg: Message) => void
) {
  const callbackRef = useRef(onNewMessage)
  callbackRef.current = onNewMessage

  useEffect(() => {
    if (!clientId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`messages:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          callbackRef.current(newMsg)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clientId])
}
