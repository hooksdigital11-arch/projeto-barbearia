-- Migration: KPIs Analíticos Avançados
-- Agregações de períodos para comparação (Trend)

-- 1. View de Receita Mensal Agregada
CREATE OR REPLACE VIEW view_monthly_revenue AS
SELECT 
  organization_id,
  DATE_TRUNC('month', start_time) as month,
  COALESCE(SUM(price_cents) FILTER (WHERE status = 'completed'), 0) as total_revenue_cents,
  COUNT(*) FILTER (WHERE status = 'completed') as total_appointments
FROM appointments
GROUP BY organization_id, DATE_TRUNC('month', start_time);

-- 2. View de Novos Clientes por Mês
CREATE OR REPLACE VIEW view_monthly_new_clients AS
SELECT 
  organization_id,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_clients_count
FROM clients
GROUP BY organization_id, DATE_TRUNC('month', created_at);

-- 3. RPC Consolidada para Dashboard Admin (O Cérebro do Dash)
CREATE OR REPLACE FUNCTION get_admin_dashboard_kpis(p_org_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_month TIMESTAMP := DATE_TRUNC('month', NOW());
  v_last_month TIMESTAMP := DATE_TRUNC('month', NOW() - INTERVAL '1 month');
  v_today DATE := CURRENT_DATE;
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'revenue', (
      SELECT jsonb_build_object(
        'current', COALESCE(curr.total_revenue_cents, 0),
        'last', COALESCE(prev.total_revenue_cents, 0)
      )
      FROM (SELECT 1) dummy
      LEFT JOIN view_monthly_revenue curr ON curr.organization_id = p_org_id AND curr.month = v_current_month
      LEFT JOIN view_monthly_revenue prev ON prev.organization_id = p_org_id AND prev.month = v_last_month
    ),
    'appointments', (
      SELECT jsonb_build_object(
        'total', COALESCE(total_appointments, 0),
        'completed', COALESCE(completed, 0),
        'no_show', COALESCE(no_show, 0)
      )
      FROM view_dashboard_daily
      WHERE organization_id = p_org_id AND target_date = v_today
    ),
    'clients', (
      SELECT jsonb_build_object(
        'current', COALESCE(curr.new_clients_count, 0),
        'last', COALESCE(prev.new_clients_count, 0)
      )
      FROM (SELECT 1) dummy
      LEFT JOIN view_monthly_new_clients curr ON curr.organization_id = p_org_id AND curr.month = v_current_month
      LEFT JOIN view_monthly_new_clients prev ON prev.organization_id = p_org_id AND prev.month = v_last_month
    )
  ) INTO v_result;

  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
