-- Add lembrete_enviado column to appointments for reminder tracking
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS lembrete_enviado BOOLEAN DEFAULT FALSE;

-- Index to speed up cron query (tomorrow's un-reminded appointments)
CREATE INDEX IF NOT EXISTS idx_appointments_lembrete
  ON public.appointments (organization_id, lembrete_enviado, start_time)
  WHERE status IN ('scheduled', 'confirmed');
