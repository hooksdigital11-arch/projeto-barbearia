-- Performance indexes for the most frequent query patterns.
-- All are CREATE INDEX IF NOT EXISTS (safe to re-run).
-- Composite indexes ordered: equality filters first, then range/sort columns.

-- ─── appointments ─────────────────────────────────────────────────────────────
-- Used by: getAppointments(), getAppointmentStats(), barber dashboard, reports
CREATE INDEX IF NOT EXISTS idx_appointments_org_start
  ON public.appointments (organization_id, start_time DESC);

-- Used by: getTeamWithStats(), barber-specific appointment queries, updateAppointmentStatus
CREATE INDEX IF NOT EXISTS idx_appointments_org_barber_start
  ON public.appointments (organization_id, barber_id, start_time DESC);

-- Used by: cancelAppointment(), updateAppointmentStatus(), stats queries
CREATE INDEX IF NOT EXISTS idx_appointments_org_status
  ON public.appointments (organization_id, status);

-- Used by: client booking flow (client_id lookup via profile_id)
CREATE INDEX IF NOT EXISTS idx_appointments_org_client
  ON public.appointments (organization_id, client_id);

-- Used by: checkTimeConflict() — range overlap check
CREATE INDEX IF NOT EXISTS idx_appointments_barber_time_range
  ON public.appointments (barber_id, start_time, end_time);

-- ─── clients ──────────────────────────────────────────────────────────────────
-- Used by: getClients(), getClientsStats(), getClientsForAppointment()
CREATE INDEX IF NOT EXISTS idx_clients_org_status
  ON public.clients (organization_id, status);

-- Used by: getClientDashboardData(), createClientAppointment() — profile lookup
CREATE INDEX IF NOT EXISTS idx_clients_org_profile
  ON public.clients (organization_id, profile_id);

-- Used by: full-text search in getClients()
CREATE INDEX IF NOT EXISTS idx_clients_org_name
  ON public.clients (organization_id, full_name);

-- ─── comanda_items ────────────────────────────────────────────────────────────
-- Used by: getComandasHistory(), getComandasStats(), revenue reports
CREATE INDEX IF NOT EXISTS idx_comanda_items_org_paid_at
  ON public.comanda_items (organization_id, paid, paid_at DESC);

-- Used by: getActiveComanda() — unpaid items for a client
CREATE INDEX IF NOT EXISTS idx_comanda_items_org_client_paid
  ON public.comanda_items (organization_id, client_id, paid);

-- ─── loyalty_stamps ───────────────────────────────────────────────────────────
-- Used by: getClientStamps(), getAllClientsLoyalty(), getLoyaltyStats()
CREATE INDEX IF NOT EXISTS idx_loyalty_stamps_org_client
  ON public.loyalty_stamps (organization_id, client_id);

-- Used by: getLoyaltyStats() — redeem count by month
CREATE INDEX IF NOT EXISTS idx_loyalty_stamps_org_type_created
  ON public.loyalty_stamps (organization_id, type, created_at DESC);

-- ─── messages ─────────────────────────────────────────────────────────────────
-- Used by: getMessagesForClient(), getConversations(), API route
CREATE INDEX IF NOT EXISTS idx_messages_org_client_created
  ON public.messages (organization_id, client_id, created_at DESC);

-- Used by: getConversations() filtered by barber (sent_by)
CREATE INDEX IF NOT EXISTS idx_messages_org_sentby_created
  ON public.messages (organization_id, sent_by, created_at DESC);

-- ─── inventory ────────────────────────────────────────────────────────────────
-- Used by: getInventory(), getInventoryStats()
CREATE INDEX IF NOT EXISTS idx_inventory_org_active
  ON public.inventory (organization_id, active);

-- ─── inventory_movements ─────────────────────────────────────────────────────
-- Used by: getSalesByPeriodAction(), revenue reports
CREATE INDEX IF NOT EXISTS idx_inventory_movements_org_type_created
  ON public.inventory_movements (organization_id, type, created_at DESC);

-- ─── waiting_list ─────────────────────────────────────────────────────────────
-- Used by: getWaitingList() — status filter + position order
CREATE INDEX IF NOT EXISTS idx_waiting_list_org_status_position
  ON public.waiting_list (organization_id, status, position);

-- ─── message_templates ────────────────────────────────────────────────────────
-- Used by: getMessageTemplates()
CREATE INDEX IF NOT EXISTS idx_message_templates_org_active
  ON public.message_templates (organization_id, is_active);

-- ─── profiles ─────────────────────────────────────────────────────────────────
-- Used by: getTeam(), getTeamWithStats(), getBarbersForAppointment()
CREATE INDEX IF NOT EXISTS idx_profiles_org_role
  ON public.profiles (organization_id, role);

-- ─── services ─────────────────────────────────────────────────────────────────
-- Used by: getActiveServices(), getServices()
CREATE INDEX IF NOT EXISTS idx_services_org_active
  ON public.services (organization_id, is_active);
