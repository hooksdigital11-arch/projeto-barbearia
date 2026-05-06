-- ═══════════════════════════════════════════════════════════════
-- STEP 1: SERVIÇOS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO services (id, organization_id, name, description, price_cents, category, active) VALUES
('aaaa0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Corte Masculino', 'Corte tradicional na tesoura e máquina', 5000, 'corte', true),
('aaaa0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Barba', 'Aparar e modelar barba com navalha', 4000, 'barba', true),
('aaaa0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Corte + Barba', 'Combo completo corte e barba', 8000, 'combo', true),
('aaaa0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Sobrancelha', 'Modelagem de sobrancelha masculina', 2000, 'outros', true),
('aaaa0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Hidratação Capilar', 'Tratamento e hidratação dos fios', 6000, 'outros', true),
('aaaa0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Relaxamento', 'Progressiva masculina', 12000, 'outros', true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: PROFILES DOS BARBEIROS
-- ═══════════════════════════════════════════════════════════════

-- Inserir profiles dos barbeiros (além dos 3 usuários de teste se existirem)
-- O ID a29c44ea-f737-48d7-9d77-f5730ff892b5 foi encontrado na sua base como daviramosmachado21@gmail.com
INSERT INTO profiles (id, email, full_name, role, organization_id, status, specialty, phone) VALUES
('a29c44ea-f737-48d7-9d77-f5730ff892b5', 'daviramosmachado21@gmail.com', 'Davi Ramos', 'barber', '11111111-1111-1111-1111-111111111111', 'active', 'corte_barba', '(11) 98765-0000'),
('bbbb0001-0000-0000-0000-000000000001', 'rafael@barbearia.dev', 'Rafael Silva', 'barber', '11111111-1111-1111-1111-111111111111', 'active', 'corte_barba', '(11) 98765-0001'),
('bbbb0001-0000-0000-0000-000000000002', 'thiago@barbearia.dev', 'Thiago Santos', 'barber', '11111111-1111-1111-1111-111111111111', 'active', 'barba', '(11) 98765-0002'),
('bbbb0001-0000-0000-0000-000000000003', 'marcos@barbearia.dev', 'Marcos Costa', 'barber', '11111111-1111-1111-1111-111111111111', 'active', 'corte', '(11) 98765-0003')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: CLIENTES (20 clientes brasileiros)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO clients (id, organization_id, full_name, email, phone, birthday, status, total_visits, total_spent_cents, last_visit_at, preferred_barber_id, notes) VALUES
('cccc0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'João Silva', 'joao.silva@email.com', '(11) 98765-1001', '1990-03-15', 'active', 12, 65000, NOW() - INTERVAL '3 days', 'bbbb0001-0000-0000-0000-000000000001', 'Prefere barba bem aparada. Alérgico a produtos com álcool.'),
('cccc0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Maria Santos', 'maria.santos@email.com', '(11) 98765-1002', '1985-07-22', 'active', 8, 42000, NOW() - INTERVAL '7 days', 'bbbb0001-0000-0000-0000-000000000002', 'Cliente fiel. Sempre pede hidratação após o corte.'),
('cccc0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Pedro Costa', 'pedro.costa@email.com', '(11) 98765-1003', '1995-11-08', 'active', 5, 28000, NOW() - INTERVAL '14 days', 'bbbb0001-0000-0000-0000-000000000003', NULL),
('cccc0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Ana Oliveira', 'ana.oliveira@email.com', '(11) 98765-1004', '1992-05-30', 'active', 15, 78000, NOW() - INTERVAL '5 days', 'bbbb0001-0000-0000-0000-000000000001', 'VIP. Sempre agenda com antecedência.'),
('cccc0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 98765-1005', '1988-09-12', 'active', 20, 102000, NOW() - INTERVAL '2 days', 'bbbb0001-0000-0000-0000-000000000001', 'Melhor cliente. Indica sempre amigos.'),
('cccc0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Lucas Pereira', 'lucas.pereira@email.com', '(11) 98765-1006', '1998-01-25', 'active', 3, 15000, NOW() - INTERVAL '21 days', NULL, NULL),
('cccc0001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Fernanda Lima', 'fernanda.lima@email.com', '(11) 98765-1007', '1993-06-18', 'active', 7, 38000, NOW() - INTERVAL '10 days', 'bbbb0001-0000-0000-0000-000000000002', 'Gosta de conversar. Chega sempre 10min antes.'),
('cccc0001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Roberto Alves', 'roberto.alves@email.com', '(11) 98765-1008', '1980-12-03', 'active', 25, 135000, NOW() - INTERVAL '1 days', 'bbbb0001-0000-0000-0000-000000000001', 'Cliente desde o início. Muito pontual.'),
('cccc0001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Juliana Souza', 'juliana.souza@email.com', '(11) 98765-1009', '1996-04-07', 'active', 4, 22000, NOW() - INTERVAL '18 days', NULL, NULL),
('cccc0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Marcos Rodrigues', 'marcos.rod@email.com', '(11) 98765-1010', '1987-08-14', 'active', 9, 49000, NOW() - INTERVAL '6 days', 'bbbb0001-0000-0000-0000-000000000003', 'Prefere corte degradê.'),
('cccc0001-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'Patricia Mendes', 'patricia.m@email.com', '(11) 98765-1011', '1991-02-28', 'active', 6, 32000, NOW() - INTERVAL '12 days', 'bbbb0001-0000-0000-0000-000000000002', NULL),
('cccc0001-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'Diego Nascimento', 'diego.n@email.com', '(11) 98765-1012', '1994-10-20', 'active', 2, 10000, NOW() - INTERVAL '35 days', NULL, 'Cliente novo, veio indicado pelo Carlos.'),
('cccc0001-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'Camila Torres', 'camila.t@email.com', '(11) 98765-1013', '1997-07-11', 'active', 11, 58000, NOW() - INTERVAL '4 days', 'bbbb0001-0000-0000-0000-000000000001', NULL),
('cccc0001-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'Felipe Barbosa', 'felipe.b@email.com', '(11) 98765-1014', '1989-03-05', 'active', 16, 84000, NOW() - INTERVAL '8 days', 'bbbb0001-0000-0000-0000-000000000003', 'Sempre compra pomada.'),
('cccc0001-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'Beatriz Carvalho', 'beatriz.c@email.com', '(11) 98765-1015', '2000-05-06', 'active', 1, 5000, NOW() - INTERVAL '45 days', NULL, NULL),
('cccc0001-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'Gustavo Martins', 'gustavo.m@email.com', '(11) 98765-1016', '1986-09-30', 'active', 18, 95000, NOW() - INTERVAL '3 days', 'bbbb0001-0000-0000-0000-000000000002', 'Prefere horário no final do dia.'),
('cccc0001-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', 'Larissa Gomes', 'larissa.g@email.com', '(11) 98765-1017', '1993-12-15', 'active', 13, 68000, NOW() - INTERVAL '9 days', 'bbbb0001-0000-0000-0000-000000000001', NULL),
('cccc0001-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111111', 'Thiago Ribeiro', 'thiago.r@email.com', '(11) 98765-1018', '1999-06-22', 'active', 7, 37000, NOW() - INTERVAL '15 days', NULL, NULL),
('cccc0001-0000-0000-0000-000000000019', '11111111-1111-1111-1111-111111111111', 'Vanessa Cruz', 'vanessa.c@email.com', '(11) 98765-1019', '1990-01-17', 'inactive', 2, 9000, NOW() - INTERVAL '65 days', NULL, NULL),
('cccc0001-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 'Anderson Lima', 'anderson.l@email.com', '(11) 98765-1020', '1984-11-09', 'active', 22, 118000, NOW() - INTERVAL '1 days', 'bbbb0001-0000-0000-0000-000000000001', 'Segundo melhor cliente. Pontualíssimo.')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 4: AGENDAMENTOS (passados — últimos 30 dias)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO appointments (id, organization_id, client_id, barber_id, service_id, start_time, end_time, status, price_cents, rating, review_comment) VALUES
-- Semana passada
('dddd0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '7 days' + INTERVAL '9 hours', NOW() - INTERVAL '7 days' + INTERVAL '10 hours', 'completed', 8000, 5, 'Excelente serviço!'),
('dddd0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000002', NOW() - INTERVAL '7 days' + INTERVAL '10 hours', NOW() - INTERVAL '7 days' + INTERVAL '10 hours 30 minutes', 'completed', 4000, 5, 'Ótimo atendimento'),
('dddd0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000003', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days' + INTERVAL '11 hours', NOW() - INTERVAL '7 days' + INTERVAL '11 hours 30 minutes', 'completed', 5000, 4, NULL),
('dddd0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000004', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '6 days' + INTERVAL '9 hours', NOW() - INTERVAL '6 days' + INTERVAL '10 hours', 'completed', 8000, 5, 'Perfeito como sempre!'),
('dddd0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000005', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', NOW() - INTERVAL '6 days' + INTERVAL '14 hours', NOW() - INTERVAL '6 days' + INTERVAL '14 hours 30 minutes', 'completed', 5000, 5, NULL),
('dddd0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000006', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000002', NOW() - INTERVAL '5 days' + INTERVAL '10 hours', NOW() - INTERVAL '5 days' + INTERVAL '10 hours 30 minutes', 'cancelled', 4000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000007', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '5 days' + INTERVAL '11 hours', NOW() - INTERVAL '5 days' + INTERVAL '12 hours', 'completed', 8000, 4, 'Muito bom'),
('dddd0001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000008', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '4 days' + INTERVAL '9 hours', NOW() - INTERVAL '4 days' + INTERVAL '10 hours', 'completed', 8000, 5, 'Sempre impecável!'),
('dddd0001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000009', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days' + INTERVAL '15 hours', NOW() - INTERVAL '4 days' + INTERVAL '15 hours 30 minutes', 'no_show', 5000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000010', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000002', NOW() - INTERVAL '3 days' + INTERVAL '10 hours', NOW() - INTERVAL '3 days' + INTERVAL '10 hours 30 minutes', 'completed', 4000, 4, NULL),
('dddd0001-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000011', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days' + INTERVAL '14 hours', NOW() - INTERVAL '3 days' + INTERVAL '14 hours 30 minutes', 'completed', 5000, 5, 'Amei o resultado!'),
('dddd0001-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000013', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '2 days' + INTERVAL '9 hours', NOW() - INTERVAL '2 days' + INTERVAL '10 hours', 'completed', 8000, 5, NULL),
('dddd0001-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000014', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days' + INTERVAL '11 hours', NOW() - INTERVAL '2 days' + INTERVAL '11 hours 30 minutes', 'completed', 5000, 4, NULL),
('dddd0001-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000016', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '1 days' + INTERVAL '16 hours', NOW() - INTERVAL '1 days' + INTERVAL '17 hours', 'completed', 8000, 5, 'Melhor barbearia da cidade!'),
('dddd0001-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000020', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW() - INTERVAL '1 days' + INTERVAL '14 hours', NOW() - INTERVAL '1 days' + INTERVAL '15 hours', 'completed', 8000, 5, NULL),

-- Agendamentos de HOJE
('dddd0001-0000-0000-0000-000000000016', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', NOW()::date + INTERVAL '9 hours', NOW()::date + INTERVAL '9 hours 30 minutes', 'completed', 5000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000017', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000005', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW()::date + INTERVAL '10 hours', NOW()::date + INTERVAL '11 hours', 'in_progress', 8000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000018', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000008', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000002', NOW()::date + INTERVAL '11 hours', NOW()::date + INTERVAL '11 hours 30 minutes', 'scheduled', 4000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000019', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000004', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW()::date + INTERVAL '14 hours', NOW()::date + INTERVAL '15 hours', 'scheduled', 8000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000020', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000017', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', NOW()::date + INTERVAL '15 hours', NOW()::date + INTERVAL '15 hours 30 minutes', 'scheduled', 5000, NULL, NULL),

-- Agendamentos FUTUROS
('dddd0001-0000-0000-0000-000000000021', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000002', 'aaaa0001-0000-0000-0000-000000000002', NOW() + INTERVAL '1 days' + INTERVAL '10 hours', NOW() + INTERVAL '1 days' + INTERVAL '10 hours 30 minutes', 'scheduled', 4000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000022', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000007', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000003', NOW() + INTERVAL '2 days' + INTERVAL '14 hours', NOW() + INTERVAL '2 days' + INTERVAL '15 hours', 'scheduled', 8000, NULL, NULL),
('dddd0001-0000-0000-0000-000000000023', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000013', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', NOW() + INTERVAL '3 days' + INTERVAL '9 hours', NOW() + INTERVAL '3 days' + INTERVAL '9 hours 30 minutes', 'scheduled', 5000, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 5: COMANDA_ITEMS
-- ═══════════════════════════════════════════════════════════════

INSERT INTO comanda_items (id, organization_id, appointment_id, client_id, barber_id, item_type, name, quantity, unit_price_cents, total_cents, paid, paid_at, payment_method) VALUES
-- Comandas dos agendamentos completados
('eeee0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '7 days', 'pix'),
('eeee0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000001', 'cccc0001-0000-0000-0000-000000000001', 'bbbb0001-0000-0000-0000-000000000001', 'product', 'Pomada Matte', 1, 3500, 3500, true, NOW() - INTERVAL '7 days', 'pix'),
('eeee0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000002', 'cccc0001-0000-0000-0000-000000000002', 'bbbb0001-0000-0000-0000-000000000002', 'service', 'Barba', 1, 4000, 4000, true, NOW() - INTERVAL '7 days', 'cash'),
('eeee0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000004', 'cccc0001-0000-0000-0000-000000000004', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '6 days', 'credit_card'),
('eeee0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000005', 'cccc0001-0000-0000-0000-000000000005', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte Masculino', 1, 5000, 5000, true, NOW() - INTERVAL '6 days', 'pix'),
('eeee0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000007', 'cccc0001-0000-0000-0000-000000000007', 'bbbb0001-0000-0000-0000-000000000002', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '5 days', 'debit_card'),
('eeee0001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000008', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '4 days', 'pix'),
('eeee0001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000008', 'cccc0001-0000-0000-0000-000000000008', 'bbbb0001-0000-0000-0000-000000000001', 'product', 'Shampoo Profissional', 1, 4500, 4500, true, NOW() - INTERVAL '4 days', 'pix'),
('eeee0001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000010', 'cccc0001-0000-0000-0000-000000000010', 'bbbb0001-0000-0000-0000-000000000003', 'service', 'Barba', 1, 4000, 4000, true, NOW() - INTERVAL '3 days', 'cash'),
('eeee0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000011', 'cccc0001-0000-0000-0000-000000000011', 'bbbb0001-0000-0000-0000-000000000002', 'service', 'Corte Masculino', 1, 5000, 5000, true, NOW() - INTERVAL '3 days', 'pix'),
('eeee0001-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000012', 'cccc0001-0000-0000-0000-000000000013', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '2 days', 'credit_card'),
('eeee0001-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000014', 'cccc0001-0000-0000-0000-000000000016', 'bbbb0001-0000-0000-0000-000000000002', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '1 days', 'pix'),
('eeee0001-0000-0000-0000-000000000013', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000015', 'cccc0001-0000-0000-0000-000000000020', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte + Barba', 1, 8000, 8000, true, NOW() - INTERVAL '1 days', 'pix'),
('eeee0001-0000-0000-0000-000000000014', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000015', 'cccc0001-0000-0000-0000-000000000020', 'bbbb0001-0000-0000-0000-000000000001', 'product', 'Pomada Capilar', 2, 3500, 7000, true, NOW() - INTERVAL '1 days', 'pix'),

-- Comanda aberta (hoje, em andamento)
('eeee0001-0000-0000-0000-000000000015', '11111111-1111-1111-1111-111111111111', 'dddd0001-0000-0000-0000-000000000017', 'cccc0001-0000-0000-0000-000000000005', 'bbbb0001-0000-0000-0000-000000000001', 'service', 'Corte + Barba', 1, 8000, 8000, false, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 6: INVENTORY (Estoque)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO inventory (id, organization_id, name, description, category, type, quantity, min_quantity, cost_cents, price_cents, supplier, supplier_phone, active) VALUES
('ffff0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Pomada Matte Black', 'Pomada modeladora efeito matte', 'pomada', 'revenda', 15, 5, 1500, 3500, 'Distribuidora Style', '(11) 3333-1001', true),
('ffff0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Pomada Capilar Forte', 'Pomada fixação extra forte', 'pomada', 'revenda', 8, 5, 1800, 4000, 'Distribuidora Style', '(11) 3333-1001', true),
('ffff0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Shampoo Profissional', 'Shampoo para uso profissional 1L', 'shampoo', 'revenda', 12, 5, 2000, 4500, 'Beleza Total', '(11) 3333-1002', true),
('ffff0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Condicionador Hidratante', 'Condicionador profissional 1L', 'shampoo', 'revenda', 3, 5, 2200, 5000, 'Beleza Total', '(11) 3333-1002', true),
('ffff0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Lâmina Gillette Profissional', 'Caixa com 10 lâminas', 'lamina', 'uso_interno', 4, 10, 800, NULL, 'Fornecedor ABC', '(11) 3333-1003', true),
('ffff0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'Tesoura Profissional Inox', 'Tesoura 6 polegadas para corte', 'tesoura', 'uso_interno', 6, 2, 8000, NULL, 'Tools Pro', '(11) 3333-1004', true),
('ffff0001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'Pente Profissional', 'Kit com 5 pentes variados', 'outros', 'uso_interno', 20, 5, 500, NULL, 'Tools Pro', '(11) 3333-1004', true),
('ffff0001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'Óleo para Barba', 'Óleo hidratante para barba 30ml', 'outros', 'revenda', 10, 5, 1200, 2800, 'Distribuidora Style', '(11) 3333-1001', true),
('ffff0001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'Talco Antisséptico', 'Talco para finalização', 'outros', 'uso_interno', 2, 3, 600, NULL, 'Fornecedor ABC', '(11) 3333-1003', true),
('ffff0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'Máquina de Corte Wahl', 'Máquina profissional bivolt', 'outros', 'uso_interno', 3, 2, 45000, NULL, 'Tools Pro', '(11) 3333-1004', true)
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 7: LOYALTY_STAMPS (Fidelidade)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO loyalty_stamps (id, organization_id, client_id, appointment_id, type, amount, notes) VALUES
-- João Silva (7/10)
('gggg0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000001', 'dddd0001-0000-0000-0000-000000000001', 'stamp', 1, 'Automático após atendimento'),
('gggg0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000001', NULL, 'stamp', 6, 'Carimbos anteriores migrados'),

-- Carlos Ferreira (10/10 — pronto para resgatar!)
('gggg0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000005', 'dddd0001-0000-0000-0000-000000000005', 'stamp', 10, 'Carimbos acumulados'),

-- Ana Oliveira (5/10)
('gggg0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000004', 'dddd0001-0000-0000-0000-000000000004', 'stamp', 5, 'Automático após atendimento'),

-- Roberto Alves — já resgatou e tem 3 novos
('gggg0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000008', NULL, 'stamp', 10, 'Carimbos acumulados'),
('gggg0001-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000008', NULL, 'redeem', 10, 'Resgate: 1 corte grátis | Código: FIDE-2026-AB12'),
('gggg0001-0000-0000-0000-000000000007', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000008', 'dddd0001-0000-0000-0000-000000000008', 'stamp', 3, 'Carimbos após resgate'),

-- Anderson Lima (8/10)
('gggg0001-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000020', 'dddd0001-0000-0000-0000-000000000015', 'stamp', 8, 'Automático após atendimentos'),

-- Demais clientes com poucos carimbos
('gggg0001-0000-0000-0000-000000000009', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000002', 'dddd0001-0000-0000-0000-000000000002', 'stamp', 3, 'Automático'),
('gggg0001-0000-0000-0000-000000000010', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000007', 'dddd0001-0000-0000-0000-000000000007', 'stamp', 6, 'Automático'),
('gggg0001-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000016', 'dddd0001-0000-0000-0000-000000000014', 'stamp', 9, 'Automático'),
('gggg0001-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000013', 'dddd0001-0000-0000-0000-000000000012', 'stamp', 4, 'Automático')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 8: WAITING_LIST (Fila de espera)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO waiting_list (id, organization_id, client_id, barber_id, service_id, position, status, estimated_wait_minutes, arrived_at) VALUES
('hhhh0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000006', 'bbbb0001-0000-0000-0000-000000000001', 'aaaa0001-0000-0000-0000-000000000001', 1, 'waiting', 30, NOW() - INTERVAL '20 minutes'),
('hhhh0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000009', NULL, 'aaaa0001-0000-0000-0000-000000000002', 2, 'waiting', 60, NOW() - INTERVAL '10 minutes'),
('hhhh0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000012', 'bbbb0001-0000-0000-0000-000000000003', 'aaaa0001-0000-0000-0000-000000000001', 3, 'waiting', 90, NOW() - INTERVAL '5 minutes')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 9: MESSAGES (Histórico de mensagens)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO messages (id, organization_id, client_id, channel, direction, content, template_used, status, sent_by) VALUES
('iiii0001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000001', 'whatsapp', 'sent', 'Olá João! Lembrando seu agendamento amanhã às 09:00 com Rafael. Até lá! 💈', 'LEMBRETE_AGENDAMENTO', 'sent', 'bbbb0001-0000-0000-0000-000000000001'),
('iiii0001-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000004', 'whatsapp', 'sent', 'Feliz aniversário, Ana! 🎉 Como presente, você ganhou 10% de desconto na próxima visita!', 'ANIVERSARIO', 'sent', 'bbbb0001-0000-0000-0000-000000000001'),
('iiii0001-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000005', 'whatsapp', 'sent', 'Parabéns Carlos! Você completou seus carimbos e ganhou 1 corte grátis. Agende agora! 🎁', 'FIDELIDADE_PRONTA', 'sent', 'bbbb0001-0000-0000-0000-000000000001'),
('iiii0001-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000019', 'whatsapp', 'sent', 'Sentimos sua falta, Vanessa! Faz mais de 60 dias que você não nos visita. Que tal agendar? ✂️', 'INATIVO', 'sent', 'bbbb0001-0000-0000-0000-000000000001'),
('iiii0001-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'cccc0001-0000-0000-0000-000000000008', 'whatsapp', 'sent', 'Olá Roberto! Seu agendamento foi confirmado para amanhã às 09:00 com Rafael. ✅', 'CONFIRMACAO_AGENDAMENTO', 'sent', 'bbbb0001-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════
-- STEP 10: ACTIVITY_LOG
-- ═══════════════════════════════════════════════════════════════

INSERT INTO activity_log (organization_id, user_id, action, entity_type, entity_id, details) VALUES
('11111111-1111-1111-1111-111111111111', 'bbbb0001-0000-0000-0000-000000000001', 'create', 'appointment', 'dddd0001-0000-0000-0000-000000000001', '{"client": "João Silva", "service": "Corte + Barba"}'),
('11111111-1111-1111-1111-111111111111', 'bbbb0001-0000-0000-0000-000000000001', 'complete', 'appointment', 'dddd0001-0000-0000-0000-000000000001', '{"total": "R$ 115,00", "payment": "pix"}'),
('11111111-1111-1111-1111-111111111111', 'bbbb0001-0000-0000-0000-000000000002', 'create', 'client', 'cccc0001-0000-0000-0000-000000000006', '{"name": "Lucas Pereira"}'),
('11111111-1111-1111-1111-111111111111', 'bbbb0001-0000-0000-0000-000000000001', 'update', 'inventory', 'ffff0001-0000-0000-0000-000000000001', '{"action": "saida", "quantity": 2, "reason": "venda"}');

-- ═══════════════════════════════════════════════════════════════
-- VERIFICAÇÃO FINAL
-- ═══════════════════════════════════════════════════════════════

SELECT 'services' as tabela, count(*) as total FROM services WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'clients', count(*) FROM clients WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'appointments', count(*) FROM appointments WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'comanda_items', count(*) FROM comanda_items WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'inventory', count(*) FROM inventory WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'loyalty_stamps', count(*) FROM loyalty_stamps WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'waiting_list', count(*) FROM waiting_list WHERE organization_id = '11111111-1111-1111-1111-111111111111'
UNION ALL
SELECT 'messages', count(*) FROM messages WHERE organization_id = '11111111-1111-1111-1111-111111111111';
