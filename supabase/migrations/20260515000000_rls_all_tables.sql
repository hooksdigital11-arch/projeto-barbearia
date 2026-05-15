-- Enable RLS and add organization-scoped policies on all core tables.
-- Uses DO blocks so the migration is safe to re-run (idempotent).
-- supabaseAdmin (service_role) bypasses RLS by design; these policies apply
-- to the anon-key server client and the browser client.

-- Helper: resolve organization_id for the current auth user
-- (used inside USING / WITH CHECK clauses to avoid repeated sub-selects)

-- ─── profiles ────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'rls_profiles_own_org'
  ) THEN
    CREATE POLICY "rls_profiles_own_org"
      ON public.profiles
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles AS p
          WHERE p.id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── organizations ────────────────────────────────────────────────────────────
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'organizations' AND policyname = 'rls_organizations_own'
  ) THEN
    CREATE POLICY "rls_organizations_own"
      ON public.organizations
      FOR ALL
      USING (
        id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── services ────────────────────────────────────────────────────────────────
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'services' AND policyname = 'rls_services_own_org'
  ) THEN
    CREATE POLICY "rls_services_own_org"
      ON public.services
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── clients ─────────────────────────────────────────────────────────────────
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'rls_clients_own_org'
  ) THEN
    CREATE POLICY "rls_clients_own_org"
      ON public.clients
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── appointments ─────────────────────────────────────────────────────────────
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'appointments' AND policyname = 'rls_appointments_own_org'
  ) THEN
    CREATE POLICY "rls_appointments_own_org"
      ON public.appointments
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── waiting_list ─────────────────────────────────────────────────────────────
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'waiting_list' AND policyname = 'rls_waiting_list_own_org'
  ) THEN
    CREATE POLICY "rls_waiting_list_own_org"
      ON public.waiting_list
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── loyalty_stamps ───────────────────────────────────────────────────────────
ALTER TABLE public.loyalty_stamps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loyalty_stamps' AND policyname = 'rls_loyalty_stamps_own_org'
  ) THEN
    CREATE POLICY "rls_loyalty_stamps_own_org"
      ON public.loyalty_stamps
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── comanda_items ────────────────────────────────────────────────────────────
ALTER TABLE public.comanda_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'comanda_items' AND policyname = 'rls_comanda_items_own_org'
  ) THEN
    CREATE POLICY "rls_comanda_items_own_org"
      ON public.comanda_items
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── inventory ────────────────────────────────────────────────────────────────
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'rls_inventory_own_org'
  ) THEN
    CREATE POLICY "rls_inventory_own_org"
      ON public.inventory
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── inventory_movements ─────────────────────────────────────────────────────
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inventory_movements' AND policyname = 'rls_inventory_movements_own_org'
  ) THEN
    CREATE POLICY "rls_inventory_movements_own_org"
      ON public.inventory_movements
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── messages ─────────────────────────────────────────────────────────────────
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'rls_messages_own_org'
  ) THEN
    CREATE POLICY "rls_messages_own_org"
      ON public.messages
      FOR ALL
      USING (
        organization_id = (
          SELECT organization_id FROM public.profiles
          WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ─── activity_log ─────────────────────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_log') THEN
    EXECUTE 'ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE tablename = 'activity_log' AND policyname = 'rls_activity_log_own_org'
    ) THEN
      EXECUTE $inner$
        CREATE POLICY "rls_activity_log_own_org"
          ON public.activity_log
          FOR ALL
          USING (
            organization_id = (
              SELECT organization_id FROM public.profiles
              WHERE id = auth.uid()
            )
          )
      $inner$;
    END IF;
  END IF;
END $$;
