-- SQL Script para Analytics e Dashboards
-- Criação de Funções (RPCs) no Supabase para agregar dados complexos

-- 1. Dashboard Daily Stats
CREATE OR REPLACE FUNCTION get_dashboard_daily_stats(p_organization_id UUID)
RETURNS TABLE (
  total_revenue_cents BIGINT,
  total_appointments INT,
  completed_appointments INT,
  pending_appointments INT
) AS $$
DECLARE
  v_start_of_day TIMESTAMP;
BEGIN
  v_start_of_day := date_trunc('day', now());

  RETURN QUERY
  SELECT
    COALESCE(SUM(price_cents) FILTER (WHERE status = 'completed'), 0)::BIGINT as total_revenue_cents,
    COUNT(*)::INT as total_appointments,
    COUNT(*) FILTER (WHERE status = 'completed')::INT as completed_appointments,
    COUNT(*) FILTER (WHERE status IN ('scheduled', 'in_progress'))::INT as pending_appointments
  FROM appointments
  WHERE organization_id = p_organization_id
    AND start_time >= v_start_of_day;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Reports Stats (Revenue, Tickets, etc)
CREATE OR REPLACE FUNCTION get_reports_stats(p_organization_id UUID, p_start_date TIMESTAMP, p_end_date TIMESTAMP)
RETURNS TABLE (
  total_revenue_cents BIGINT,
  total_appointments INT,
  average_ticket_cents BIGINT,
  total_discounts_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(price_cents), 0)::BIGINT as total_revenue_cents,
    COUNT(*)::INT as total_appointments,
    COALESCE(AVG(price_cents), 0)::BIGINT as average_ticket_cents,
    0::BIGINT as total_discounts_cents -- Simplificado, assumindo que desconto seria outra coluna
  FROM appointments
  WHERE organization_id = p_organization_id
    AND status = 'completed'
    AND start_time >= p_start_date
    AND start_time <= p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Clients Stats (Ativos, Novos, etc)
CREATE OR REPLACE FUNCTION get_client_stats(p_organization_id UUID)
RETURNS TABLE (
  total_clients INT,
  new_clients_this_month INT,
  returning_clients INT
) AS $$
DECLARE
  v_start_of_month TIMESTAMP;
BEGIN
  v_start_of_month := date_trunc('month', now());

  RETURN QUERY
  SELECT 
    COUNT(*)::INT as total_clients,
    COUNT(*) FILTER (WHERE created_at >= v_start_of_month)::INT as new_clients_this_month,
    COUNT(*) FILTER (WHERE visits > 1)::INT as returning_clients
  FROM clients
  WHERE organization_id = p_organization_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Top 10 Clients (Fidelidade/Gastos)
CREATE OR REPLACE FUNCTION get_top_clients(p_organization_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE (
  client_id UUID,
  client_name TEXT,
  total_visits INT,
  total_spent_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as client_id,
    c.name as client_name,
    c.visits as total_visits,
    c.total_spent as total_spent_cents
  FROM clients c
  WHERE c.organization_id = p_organization_id
  ORDER BY c.total_spent DESC, c.visits DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Team Stats (Comparativo de Receita por Barbeiro)
CREATE OR REPLACE FUNCTION get_team_stats(p_organization_id UUID, p_start_date TIMESTAMP, p_end_date TIMESTAMP)
RETURNS TABLE (
  barber_id UUID,
  barber_name TEXT,
  total_appointments INT,
  total_revenue_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as barber_id,
    p.full_name as barber_name,
    COUNT(a.id)::INT as total_appointments,
    COALESCE(SUM(a.price_cents), 0)::BIGINT as total_revenue_cents
  FROM profiles p
  LEFT JOIN appointments a ON a.barber_id = p.id 
    AND a.status = 'completed' 
    AND a.start_time >= p_start_date 
    AND a.start_time <= p_end_date
  WHERE p.organization_id = p_organization_id
    AND p.role = 'barber'
  GROUP BY p.id, p.full_name
  ORDER BY total_revenue_cents DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
