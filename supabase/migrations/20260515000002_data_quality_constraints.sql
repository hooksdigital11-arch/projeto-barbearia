-- Data Quality: Foreign Keys & Unique Constraints
-- Listed here for review — apply after validating against current schema.

-- ── Foreign Keys ────────────────────────────────────────────────────────────

-- waiting_list.appointment_id → appointments.id
ALTER TABLE public.waiting_list
  ADD CONSTRAINT fk_waiting_list_appointment
  FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
  ON DELETE SET NULL;

-- loyalty_stamps.appointment_id → appointments.id
ALTER TABLE public.loyalty_stamps
  ADD CONSTRAINT fk_loyalty_stamps_appointment
  FOREIGN KEY (appointment_id) REFERENCES public.appointments(id)
  ON DELETE SET NULL;

-- comanda_items.inventory_id → inventory.id
ALTER TABLE public.comanda_items
  ADD CONSTRAINT fk_comanda_items_inventory
  FOREIGN KEY (inventory_id) REFERENCES public.inventory(id)
  ON DELETE SET NULL;

-- messages.sent_by → profiles.id
ALTER TABLE public.messages
  ADD CONSTRAINT fk_messages_sent_by
  FOREIGN KEY (sent_by) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- clients.profile_id → profiles.id
ALTER TABLE public.clients
  ADD CONSTRAINT fk_clients_profile
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- ── Unique Constraints ───────────────────────────────────────────────────────

-- One email per org in clients
ALTER TABLE public.clients
  ADD CONSTRAINT clients_org_email_unique
  UNIQUE (organization_id, email);

-- One service name per org
ALTER TABLE public.services
  ADD CONSTRAINT services_org_name_unique
  UNIQUE (organization_id, name);

-- One inventory item name per org
ALTER TABLE public.inventory
  ADD CONSTRAINT inventory_org_name_unique
  UNIQUE (organization_id, name);
