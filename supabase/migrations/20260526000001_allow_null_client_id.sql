-- Allow messages from unknown clients (webhook received messages where 
-- the phone number doesn't match any client in the system)
ALTER TABLE public.messages ALTER COLUMN client_id DROP NOT NULL;
