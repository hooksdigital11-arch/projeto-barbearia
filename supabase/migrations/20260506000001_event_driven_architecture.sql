-- Migration: Arquitetura Analítica e Orientada a Eventos v2
-- Esta migração estabelece o PostgreSQL como motor de sincronização total do sistema.

-- 1. Tabela de Transações de Estoque (Auditoria e Histórico)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  inventory_id UUID REFERENCES inventory(id) NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  quantity_change INT NOT NULL,
  reason TEXT NOT NULL, -- 'sale', 'manual_adjustment', 'restock'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Trigger Function: O Cérebro do Sistema (Sincronização Atômica)
CREATE OR REPLACE FUNCTION handle_appointment_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_loyalty_config JSONB;
  v_stamps_to_add INT := 1;
BEGIN
  -- Evento: Quando o status do agendamento vira 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- a) Atualizar resumo do Cliente (Single Source of Truth de busca rápida)
    UPDATE clients 
    SET 
      total_visits = total_visits + 1,
      total_spent_cents = total_spent_cents + COALESCE(NEW.price_cents, 0),
      last_visit_at = NOW()
    WHERE id = NEW.client_id;

    -- b) Processar Fidelidade (Baseado na Config da Organização)
    SELECT loyalty_config INTO v_loyalty_config FROM organizations WHERE id = NEW.organization_id;
    
    IF v_loyalty_config IS NOT NULL AND (v_loyalty_config->>'mode') IS NOT NULL THEN
      IF v_loyalty_config->>'mode' = 'points' THEN
        v_stamps_to_add := FLOOR(COALESCE(NEW.price_cents, 0) / 100) * COALESCE((v_loyalty_config->>'points_per_real')::INT, 1);
      ELSE
        v_stamps_to_add := 1;
      END IF;

      INSERT INTO loyalty_stamps (organization_id, client_id, appointment_id, type, amount, notes)
      VALUES (NEW.organization_id, NEW.client_id, NEW.id, 'stamp', v_stamps_to_add, 'Automático: Agendamento concluído');
    END IF;

    -- c) Baixa de Estoque (Vendas de produtos vinculados na comanda)
    -- Registra no log de transações
    INSERT INTO inventory_transactions (organization_id, inventory_id, appointment_id, quantity_change, reason)
    SELECT NEW.organization_id, inventory_id, NEW.id, -quantity, 'appointment_sale'
    FROM comanda_items 
    WHERE appointment_id = NEW.id AND item_type = 'product' AND inventory_id IS NOT NULL;

    -- Atualiza saldo real no inventário
    UPDATE inventory i
    SET quantity = i.quantity - ci.quantity
    FROM comanda_items ci
    WHERE ci.inventory_id = i.id 
      AND ci.appointment_id = NEW.id
      AND ci.item_type = 'product';

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reinicializa a Trigger
DROP TRIGGER IF EXISTS on_appointment_completed ON appointments;
CREATE TRIGGER on_appointment_completed
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION handle_appointment_completion();


-- 3. Camada Analítica: Views para Dashboard e Relatórios (Agregação Automática)

-- View de Dashboard Diário (KPIs de hoje)
CREATE OR REPLACE VIEW view_dashboard_daily AS
SELECT 
  organization_id,
  DATE(start_time) as target_date,
  COUNT(*) as total_appointments,
  COUNT(*) FILTER (WHERE status = 'completed') as completed,
  COUNT(*) FILTER (WHERE status = 'cancelled') as canceled,
  COUNT(*) FILTER (WHERE status = 'no_show') as no_show,
  COALESCE(SUM(price_cents) FILTER (WHERE status = 'completed'), 0) as total_revenue_cents,
  COALESCE(AVG(price_cents) FILTER (WHERE status = 'completed'), 0) as average_ticket_cents
FROM appointments
GROUP BY organization_id, DATE(start_time);

-- View de Performance da Equipe
CREATE OR REPLACE VIEW view_team_productivity AS
SELECT 
  a.organization_id,
  a.barber_id,
  p.full_name as barber_name,
  COUNT(a.id) as total_services,
  SUM(a.price_cents) as total_revenue_cents,
  AVG(a.price_cents) as average_ticket_cents,
  DATE_TRUNC('month', a.start_time) as month
FROM appointments a
JOIN profiles p ON p.id = a.barber_id
WHERE a.status = 'completed'
GROUP BY a.organization_id, a.barber_id, p.full_name, DATE_TRUNC('month', a.start_time);

-- View de Ranking de Clientes (Fidelidade e Valor)
CREATE OR REPLACE VIEW view_client_ranking AS
SELECT 
  organization_id,
  id as client_id,
  full_name,
  total_visits,
  total_spent_cents,
  last_visit_at
FROM clients
WHERE status = 'active'
ORDER BY total_spent_cents DESC, total_visits DESC;


-- 4. RPCs Otimizadas para o Frontend
CREATE OR REPLACE FUNCTION get_dashboard_stats_v2(p_org_id UUID, p_date DATE)
RETURNS SETOF view_dashboard_daily AS $$
BEGIN
  RETURN QUERY SELECT * FROM view_dashboard_daily WHERE organization_id = p_org_id AND target_date = p_date;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_team_ranking_v2(p_org_id UUID, p_month TIMESTAMP)
RETURNS SETOF view_team_productivity AS $$
BEGIN
  RETURN QUERY SELECT * FROM view_team_productivity WHERE organization_id = p_org_id AND month = p_month;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
