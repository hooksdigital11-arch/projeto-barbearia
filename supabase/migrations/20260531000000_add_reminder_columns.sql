-- Migration to add columns for 24h and 2h reminders and confirmation status/stage
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS lembrete_24h_enviado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS lembrete_2h_enviado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS confirmacao_etapa VARCHAR(50) DEFAULT 'pendente';

-- Index to optimize querying appointments for reminders
CREATE INDEX IF NOT EXISTS idx_appointments_reminders_24h
  ON public.appointments (lembrete_24h_enviado, start_time)
  WHERE status IN ('scheduled', 'confirmed');

CREATE INDEX IF NOT EXISTS idx_appointments_reminders_2h
  ON public.appointments (lembrete_2h_enviado, start_time)
  WHERE status IN ('scheduled', 'confirmed');
