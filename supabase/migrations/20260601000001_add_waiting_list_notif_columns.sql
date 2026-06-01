-- Migration: Adicionar colunas de notificação e expiração à fila de espera
ALTER TABLE public.waiting_list
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT FALSE;

-- Index to optimize querying notified queue entries
CREATE INDEX IF NOT EXISTS idx_waiting_list_notified_expires
  ON public.waiting_list (status, expires_at)
  WHERE status = 'notified';
