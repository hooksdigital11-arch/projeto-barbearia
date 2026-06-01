-- 1. Criar função utilitária com SECURITY DEFINER para buscar a organização sem causar recursão RLS
CREATE OR REPLACE FUNCTION public.get_user_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Recriar todas as políticas RLS para utilizar a função utilitária de forma direta e segura

-- Perfis (Profiles)
DROP POLICY IF EXISTS "rls_profiles_own_org" ON public.profiles;
CREATE POLICY "rls_profiles_own_org" ON public.profiles
  FOR ALL USING (organization_id = public.get_user_org_id() OR id = auth.uid());

-- Organizações (Organizations)
DROP POLICY IF EXISTS "rls_organizations_own" ON public.organizations;
CREATE POLICY "rls_organizations_own" ON public.organizations
  FOR ALL USING (id = public.get_user_org_id());

-- Serviços (Services)
DROP POLICY IF EXISTS "rls_services_own_org" ON public.services;
CREATE POLICY "rls_services_own_org" ON public.services
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Clientes (Clients)
DROP POLICY IF EXISTS "rls_clients_own_org" ON public.clients;
CREATE POLICY "rls_clients_own_org" ON public.clients
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Agendamentos (Appointments)
DROP POLICY IF EXISTS "rls_appointments_own_org" ON public.appointments;
CREATE POLICY "rls_appointments_own_org" ON public.appointments
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Fila de Espera (Waiting List)
DROP POLICY IF EXISTS "rls_waiting_list_own_org" ON public.waiting_list;
CREATE POLICY "rls_waiting_list_own_org" ON public.waiting_list
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Carimbos de Fidelidade (Loyalty Stamps)
DROP POLICY IF EXISTS "rls_loyalty_stamps_own_org" ON public.loyalty_stamps;
CREATE POLICY "rls_loyalty_stamps_own_org" ON public.loyalty_stamps
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Itens da Comanda (Comanda Items)
DROP POLICY IF EXISTS "rls_comanda_items_own_org" ON public.comanda_items;
CREATE POLICY "rls_comanda_items_own_org" ON public.comanda_items
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Estoque (Inventory)
DROP POLICY IF EXISTS "rls_inventory_own_org" ON public.inventory;
CREATE POLICY "rls_inventory_own_org" ON public.inventory
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Movimentações de Estoque (Inventory Movements)
DROP POLICY IF EXISTS "rls_inventory_movements_own_org" ON public.inventory_movements;
CREATE POLICY "rls_inventory_movements_own_org" ON public.inventory_movements
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Mensagens (Messages)
DROP POLICY IF EXISTS "rls_messages_own_org" ON public.messages;
CREATE POLICY "rls_messages_own_org" ON public.messages
  FOR ALL USING (organization_id = public.get_user_org_id());

-- Auditoria (Activity Log)
DROP POLICY IF EXISTS "rls_activity_log_own_org" ON public.activity_log;
CREATE POLICY "rls_activity_log_own_org" ON public.activity_log
  FOR ALL USING (organization_id = public.get_user_org_id());
