-- Criar tabela de templates
CREATE TABLE public.message_templates (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  content         TEXT NOT NULL,
  trigger_type    TEXT DEFAULT 'manual',
  is_active       BOOLEAN DEFAULT true,
  is_system       BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;

-- Admin vê e gerencia templates da sua organização
CREATE POLICY "admin_manage_templates"
  ON public.message_templates
  FOR ALL
  USING (
    organization_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Trigger para updated_at
CREATE TRIGGER set_template_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Inserir os 5 templates padrão do sistema
-- (A inserção de seed deve idealmente ocorrer no supabase/seed.sql ou num script separado para cada organization,
-- mas como o usuário pediu no escopo para inserir junto, e os templates são atrelados a uma organization_id, 
-- não podemos simplesmente inserir aqui sem saber a ORG_ID. 
-- Como o usuário sugeriu "substituir 'ORG_ID' pelo organization_id real", não podemos fazer isso via migration genérica.
-- Mas, o usuário pediu esse SQL no Passo 3. Se for uma migration genérica, o ideal é criar via script.
-- Vamos deixar a migration limpa de DML e criar uma função ou colocar o seed no seed.sql)

-- Para resolver o seed: Se existem profiles, podemos inserir para a organização do admin.
-- Mas como é uma migration, não é seguro injetar DML dependente de dados não determinísticos.
-- Vou criar uma procedure ou apenas deixar a tabela e faremos a inserção sob demanda ou deixaremos sem dados
-- e o sistema insere se não encontrar.
-- Pelo plano do usuário: "INSERT INTO public.message_templates ... VALUES ('ORG_ID', ...)".
-- Vou adicionar uma migration que pega a organization de um profile e insere, mas de forma segura.

DO $$
DECLARE
  org_record RECORD;
BEGIN
  -- Para cada organização existente, inserir os templates do sistema se não existirem
  FOR org_record IN SELECT id FROM public.organizations LOOP
    -- Lembrete de Agendamento
    IF NOT EXISTS (SELECT 1 FROM public.message_templates WHERE organization_id = org_record.id AND trigger_type = 'reminder' AND is_system = true) THEN
      INSERT INTO public.message_templates (organization_id, name, description, content, trigger_type, is_system)
      VALUES (
        org_record.id, 
        'Lembrete de Agendamento',
        'Enviado 1 dia antes do horário',
        'Olá {nome}! Lembrando que amanhã você tem {servico} às {horario} com {barbeiro}. Te esperamos! ✂️',
        'reminder', 
        true
      );
    END IF;

    -- Confirmação de Agendamento
    IF NOT EXISTS (SELECT 1 FROM public.message_templates WHERE organization_id = org_record.id AND trigger_type = 'confirmation' AND is_system = true) THEN
      INSERT INTO public.message_templates (organization_id, name, description, content, trigger_type, is_system)
      VALUES (
        org_record.id, 
        'Confirmação de Agendamento',
        'Enviado ao confirmar',
        'Olá {nome}! Seu agendamento de {servico} com {barbeiro} está confirmado para {data} às {horario}. Até lá! 💈',
        'confirmation', 
        true
      );
    END IF;

    -- Feliz Aniversário
    IF NOT EXISTS (SELECT 1 FROM public.message_templates WHERE organization_id = org_record.id AND trigger_type = 'birthday' AND is_system = true) THEN
      INSERT INTO public.message_templates (organization_id, name, description, content, trigger_type, is_system)
      VALUES (
        org_record.id, 
        'Feliz Aniversário',
        'Para aniversariantes do mês',
        'Feliz aniversário, {nome}! 🎂 Como presente especial, você ganhou um desconto especial. Agende sua visita: {link_agendamento}',
        'birthday', 
        true
      );
    END IF;

    -- Fidelidade Completa
    IF NOT EXISTS (SELECT 1 FROM public.message_templates WHERE organization_id = org_record.id AND trigger_type = 'loyalty' AND is_system = true) THEN
      INSERT INTO public.message_templates (organization_id, name, description, content, trigger_type, is_system)
      VALUES (
        org_record.id, 
        'Fidelidade Completa',
        'Ao completar carimbos',
        'Parabéns {nome}! Você completou seus carimbos e ganhou um serviço grátis! Agende agora: {link_agendamento} 🏆',
        'loyalty', 
        true
      );
    END IF;

    -- Cliente Inativo
    IF NOT EXISTS (SELECT 1 FROM public.message_templates WHERE organization_id = org_record.id AND trigger_type = 'reactivation' AND is_system = true) THEN
      INSERT INTO public.message_templates (organization_id, name, description, content, trigger_type, is_system)
      VALUES (
        org_record.id, 
        'Cliente Inativo',
        'Para clientes sem visita há +30 dias',
        'Olá {nome}! Sentimos sua falta! Faz um tempinho que não te vemos. Que tal marcar uma visita? {link_agendamento} ✂️',
        'reactivation', 
        true
      );
    END IF;
  END LOOP;
END $$;
