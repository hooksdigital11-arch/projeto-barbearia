-- 1. DROP FUNCTION PARA ATUALIZAR ASSINATURA
DROP FUNCTION IF EXISTS get_admin_dashboard_kpis(UUID);

-- 2. NOVA RPC COM SUPORTE A PERÍODO
CREATE OR REPLACE FUNCTION get_admin_dashboard_kpis(p_org_id UUID, p_period TEXT DEFAULT 'month', p_search TEXT DEFAULT '')
RETURNS JSONB AS $$
DECLARE
  v_start_date TIMESTAMP;
  v_end_date TIMESTAMP := NOW();
  v_prev_start_date TIMESTAMP;
  v_prev_end_date TIMESTAMP;
  v_result JSONB;
BEGIN
  -- ... (lógica de datas mantida)
  IF p_period = 'today' THEN
    v_start_date := DATE_TRUNC('day', NOW());
    v_prev_start_date := v_start_date - INTERVAL '1 day';
    v_prev_end_date := v_start_date;
  ELSIF p_period = 'week' THEN
    v_start_date := DATE_TRUNC('day', NOW() - INTERVAL '6 days');
    v_prev_start_date := v_start_date - INTERVAL '7 days';
    v_prev_end_date := v_start_date;
  ELSE -- default: month
    v_start_date := DATE_TRUNC('month', NOW());
    v_prev_start_date := v_start_date - INTERVAL '1 month';
    v_prev_end_date := v_start_date;
  END IF;

  SELECT jsonb_build_object(
    'revenue', (
      SELECT jsonb_build_object(
        'current', COALESCE(SUM(price_cents) FILTER (WHERE start_time >= v_start_date), 0),
        'last', COALESCE(SUM(price_cents) FILTER (WHERE start_time >= v_prev_start_date AND start_time < v_prev_end_date), 0)
      )
      FROM appointments
      WHERE organization_id = p_org_id AND status = 'completed'
    ),
    'appointments', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'no_show', COUNT(*) FILTER (WHERE status = 'no_show')
      )
      FROM appointments
      WHERE organization_id = p_org_id AND start_time >= v_start_date
    ),
    'clients', (
      SELECT jsonb_build_object(
        'current', COUNT(*) FILTER (WHERE created_at >= v_start_date),
        'last', COUNT(*) FILTER (WHERE created_at >= v_prev_start_date AND created_at < v_prev_end_date)
      )
      FROM clients
      WHERE organization_id = p_org_id
    ),
    'loyalty', (
      SELECT jsonb_build_object(
        'redeemable', 0
      )
    ),
    'weekly_chart', (
      SELECT jsonb_agg(d) FROM (
        SELECT 
          TO_CHAR(day, 'DD/MM') as name,
          COALESCE((
            SELECT SUM(price_cents) / 100
            FROM appointments 
            WHERE organization_id = p_org_id 
              AND status = 'completed' 
              AND DATE_TRUNC('day', start_time) = day
          ), 0) as revenue,
          COALESCE((
            SELECT SUM(price_cents) / 100
            FROM appointments 
            WHERE organization_id = p_org_id 
              AND status = 'completed' 
              AND DATE_TRUNC('day', start_time) = day - INTERVAL '7 days'
          ), 0) as "lastWeek"
        FROM generate_series(
          DATE_TRUNC('day', NOW() - INTERVAL '6 days'),
          DATE_TRUNC('day', NOW()),
          INTERVAL '1 day'
        ) AS day
        ORDER BY day
      ) d
    ),
    'recent_activities', (
      SELECT jsonb_agg(a) FROM (
        SELECT 
          c.name as client_name,
          app.status,
          app.price_cents / 100 as value,
          TO_CHAR(app.start_time, 'HH24:MI') as time
        FROM appointments app
        JOIN clients c ON c.id = app.client_id
        WHERE app.organization_id = p_org_id
          AND (p_search = '' OR c.name ILIKE '%' || p_search || '%')
        ORDER BY app.created_at DESC
        LIMIT 5
      ) a
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
