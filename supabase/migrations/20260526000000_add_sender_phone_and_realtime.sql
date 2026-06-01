-- Add sender_phone column to messages table
-- This stores the formatted phone number of the sender for received messages,
-- allowing us to link orphan messages (without client_id) to clients later.
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS sender_phone text DEFAULT NULL;

-- Index for looking up orphan messages by sender phone
CREATE INDEX IF NOT EXISTS idx_messages_sender_phone
  ON public.messages (organization_id, sender_phone)
  WHERE sender_phone IS NOT NULL AND client_id IS NULL;

-- Enable Supabase Realtime on the messages table
-- This is required for the useRealtimeMessages hook to work
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
