-- Migration para funções de agregação de Relatórios
-- Permite filtrar dinamicamente por data e organização retornando JSON formatado

CREATE OR REPLACE FUNCTION get_revenue_report_data(
    p_org_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'kpis', (
            SELECT json_build_object(
                'totalRevenue', COALESCE(SUM(price_cents), 0) / 100.0,
                'totalComandas', COUNT(id),
                'averageTicket', CASE WHEN COUNT(id) > 0 THEN (SUM(price_cents) / COUNT(id)) / 100.0 ELSE 0 END
            )
            FROM appointments
            WHERE organization_id = p_org_id AND status = 'completed' AND start_time::date >= p_start_date AND start_time::date <= p_end_date
        ),
        'chartData', (
            SELECT COALESCE(json_agg(json_build_object('date', to_char(day, 'DD/MM'), 'revenue', revenue / 100.0)), '[]'::json)
            FROM (
                SELECT start_time::date as day, SUM(price_cents) as revenue
                FROM appointments
                WHERE organization_id = p_org_id AND status = 'completed' AND start_time::date >= p_start_date AND start_time::date <= p_end_date
                GROUP BY start_time::date
                ORDER BY start_time::date
            ) d
        ),
        'paymentMethods', (
            SELECT COALESCE(json_agg(json_build_object('method', payment_method, 'value', total / 100.0, 'percentage', (total::float / NULLIF(sum_total, 0)) * 100)), '[]'::json)
            FROM (
                SELECT payment_method, SUM(total_cents) as total, SUM(SUM(total_cents)) OVER() as sum_total
                FROM comanda_items
                WHERE organization_id = p_org_id AND paid = true AND created_at::date >= p_start_date AND created_at::date <= p_end_date
                GROUP BY payment_method
            ) p
        ),
        'topServices', (
            SELECT COALESCE(json_agg(json_build_object('name', s.name, 'quantity', qty, 'totalRevenue', rev / 100.0)), '[]'::json)
            FROM (
                SELECT service_id, COUNT(id) as qty, SUM(price_cents) as rev
                FROM appointments
                WHERE organization_id = p_org_id AND status = 'completed' AND start_time::date >= p_start_date AND start_time::date <= p_end_date
                GROUP BY service_id
                ORDER BY qty DESC
                LIMIT 5
            ) a
            JOIN services s ON s.id = a.service_id
        ),
        'barberPerformance', (
            SELECT COALESCE(json_agg(json_build_object(
                'barberId', p.id,
                'name', p.full_name,
                'appointments', qty,
                'revenue', rev / 100.0,
                'averageTicket', CASE WHEN qty > 0 THEN (rev / qty) / 100.0 ELSE 0 END
            )), '[]'::json)
            FROM (
                SELECT barber_id, COUNT(id) as qty, SUM(price_cents) as rev
                FROM appointments
                WHERE organization_id = p_org_id AND status = 'completed' AND start_time::date >= p_start_date AND start_time::date <= p_end_date
                GROUP BY barber_id
            ) a
            JOIN profiles p ON p.id = a.barber_id
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE OR REPLACE FUNCTION get_appointments_report_data(
    p_org_id UUID,
    p_start_date DATE,
    p_end_date DATE
) RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'kpis', (
            SELECT json_build_object(
                'total', COUNT(id),
                'completed', COUNT(id) FILTER (WHERE status = 'completed'),
                'cancelled', COUNT(id) FILTER (WHERE status = 'cancelled'),
                'noShow', COUNT(id) FILTER (WHERE status = 'no_show')
            )
            FROM appointments
            WHERE organization_id = p_org_id AND start_time::date >= p_start_date AND start_time::date <= p_end_date
        ),
        'statusDistribution', (
            SELECT COALESCE(json_agg(json_build_object('status', status, 'count', qty)), '[]'::json)
            FROM (
                SELECT status, COUNT(id) as qty
                FROM appointments
                WHERE organization_id = p_org_id AND start_time::date >= p_start_date AND start_time::date <= p_end_date
                GROUP BY status
            ) s
        ),
        'peakHours', (
            SELECT COALESCE(json_agg(json_build_object('hour', h || ':00', 'count', qty)), '[]'::json)
            FROM (
                SELECT EXTRACT(HOUR FROM start_time)::text as h, COUNT(id) as qty
                FROM appointments
                WHERE organization_id = p_org_id AND start_time::date >= p_start_date AND start_time::date <= p_end_date
                GROUP BY EXTRACT(HOUR FROM start_time)
                ORDER BY h
            ) h
        ),
        'barberDistribution', (
            SELECT COALESCE(json_agg(json_build_object('barberName', p.full_name, 'count', qty)), '[]'::json)
            FROM (
                SELECT barber_id, COUNT(id) as qty
                FROM appointments
                WHERE organization_id = p_org_id AND start_time::date >= p_start_date AND start_time::date <= p_end_date
                GROUP BY barber_id
            ) a
            JOIN profiles p ON p.id = a.barber_id
        )
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
