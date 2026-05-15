# Deploy Checklist — Barbearia SaaS

Data da auditoria: 2026-05-15

---

## Resultado Geral

**Status: PRONTO PARA DEPLOY** (com ressalvas listadas abaixo)

---

## 1. Variáveis de Ambiente

### Obrigatórias para produção
| Variável | Status | Nota |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Configurada | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Configurada | |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Configurada | Nunca expor no cliente |
| `NEXT_PUBLIC_APP_URL` | ✅ Configurada | Deve ser `https://` em prod |
| `NODE_ENV` | ✅ Configurada | |

### Opcionais (feature flags)
| Variável | Status | Comportamento se ausente |
|---|---|---|
| `EVOLUTION_API_URL` | ✅ Configurada | Evolution desativado (`isEvolutionConfigured()` retorna false) |
| `EVOLUTION_API_KEY` | ✅ Configurada | |
| `EVOLUTION_INSTANCE` | ✅ Configurada | |
| `EVOLUTION_ORGANIZATION_ID` | ✅ Configurada | Webhook não associa org |
| `WEBHOOK_SECRET` | ✅ Configurada | Webhook recusa requests sem header `x-webhook-secret` |
| `CRON_SECRET` | ✅ Configurada | Cron de lembretes protegido por Bearer token |
| `UPSTASH_REDIS_REST_URL` | ❌ Ausente | Rate limiting desativado (aceitável para MVP) |
| `RESEND_API_KEY` | ❌ Ausente | Envio de email transacional desativado |
| `ENCRYPTION_KEY` | ❌ Ausente | Campo encryption desativado |

**Ação antes do deploy:** garantir que `NEXT_PUBLIC_APP_URL` aponte para o domínio de produção correto (afeta o `redirectTo` do reset de senha).

---

## 2. Fluxo de Autenticação

| Tela | Rota | Status | Detalhe |
|---|---|---|---|
| Login | `/login` | ✅ | Schema Zod + role-based redirect |
| Cadastro | `/signup` | ✅ | Schema Zod + auto-login |
| Recuperação de senha | `/recovery` | ✅ | Envia email com link via callback |
| **Redefinição de senha** | `/reset-password` | ✅ **Corrigido** | Página criada; `requestPasswordReset` atualizado para rotear via `/auth/callback?next=/reset-password` |
| Callback OAuth/PKCE | `/auth/callback` | ✅ | `exchangeCodeForSession` + redirect `next` |
| Logout | Action | ✅ | `signOut()` + redirect `/login` |
| Auth-code error | `/auth/auth-code-error` | ✅ | Fallback quando callback falha |

**Correção aplicada nessa auditoria:** `requestPasswordReset` apontava para `/auth/reset-password` (rota inexistente). Corrigido para `/auth/callback?next=/reset-password` e página `/reset-password` criada dentro do route group `(auth)`.

---

## 3. Proteção de Rotas (Middleware + Guards)

| Mecanismo | Status | Cobertura |
|---|---|---|
| Middleware Supabase SSR | ✅ | Todas as rotas — não-autenticados → `/login` |
| `requireUser()` em queries | ✅ | Todas as queries do DAL |
| `requireAdmin()` / `requireBarber()` | ✅ | Actions e queries de admin/barber |
| Filtro `organization_id` | ✅ | Todas as queries do DAL |
| RLS no banco | ✅ | Migration `20260515000000_rls_all_tables.sql` pronta |

**Nota:** As 8 páginas de settings (`/admin/settings/*`) não chamam `requireAdmin()` diretamente — estão protegidas pelo middleware e pelo DAL das queries que as alimentam. Aceitável.

---

## 4. Tratamento de Erros

| Componente | Status |
|---|---|
| Error boundary global `app/error.tsx` | ✅ |
| Error boundary `/admin/messaging` | ✅ |
| Error boundary `/admin/reports` | ✅ |
| Server Actions retornam `{ error }` ou `{ success }` | ✅ (todas as 46 actions auditadas) |
| Toasts de erro em todos os formulários | ✅ |
| Notificações WhatsApp (Evolution) nunca bloqueiam a action principal | ✅ fire-and-forget com try/catch interno |

**Gap identificado:** 12 páginas de dashboard usam `<div>` genérico como fallback de Suspense em vez de um `<Skeleton>` visual. Funcional, mas degradado visualmente. Registrado em `TECH_DEBT.md`.

---

## 5. Prevenção de Double-Submit

| Mecanismo | Status | Cobertura |
|---|---|---|
| `useTransition` + `disabled={isPending}` | ✅ | 36 componentes client com formulários de mutation |
| Botões com `disabled` durante pending | ✅ | Todos os formulários auditados |

---

## 6. Validação de Inputs

| Camada | Status |
|---|---|
| Zod em todas as Server Actions | ✅ |
| UUID validation em 22 funções ID-only | ✅ (adicionado nessa auditoria) |
| Validação de tipo/tamanho de arquivo em `uploadLogo` | ✅ |
| Validação de data passada em `createClientAppointment` | ✅ |
| Schemas em `features/[nome]/schemas.ts` | ✅ |

---

## 7. Segurança

| Item | Status | Nota |
|---|---|---|
| Zero `console.log` de debug | ✅ | Removidos nessa auditoria |
| `'server-only'` em arquivos sensíveis | ✅ | `lib/evolution.ts`, `lib/supabase/admin.ts` |
| API keys Evolution nunca expostas ao cliente | ✅ | Envio 100% via Server Actions |
| Webhook `evolution` validado com `x-webhook-secret` | ✅ |  |
| Cron `lembretes` protegido com Bearer token | ✅ | |
| Confirmação antes de ações destrutivas | ✅ **Corrigido** | `handleBlock` em `client-profile.tsx` agora tem `confirm()` |
| Null safety em filtragem de appointments | ✅ **Corrigido** | Optional chaining em `admin-appointments-page.tsx` |

---

## 8. Banco de Dados — Migrations Pendentes

As seguintes migrations foram criadas nessa auditoria mas **ainda não aplicadas no Supabase**:

| Migration | Conteúdo | Risco |
|---|---|---|
| `20260515000000_rls_all_tables.sql` | RLS policies em todas as tabelas | Baixo — usa `DO $$ BEGIN IF NOT EXISTS` |
| `20260515000001_performance_indexes.sql` | Índices de performance | Baixo |
| `20260515000002_data_quality_constraints.sql` | 5 FK + 3 UNIQUE constraints | **MÉDIO** — UNIQUE pode falhar se houver duplicatas. Verificar antes de aplicar. |
| `20260515000003_add_lembrete_enviado.sql` | Coluna `lembrete_enviado` em `appointments` | Baixo |

**Ação obrigatória antes do deploy:**
1. Aplicar `20260515000000` e `20260515000001` (seguro)
2. Checar duplicatas antes de `20260515000002`:
   ```sql
   SELECT organization_id, email, COUNT(*) FROM clients GROUP BY 1,2 HAVING COUNT(*) > 1;
   SELECT organization_id, name, COUNT(*) FROM services GROUP BY 1,2 HAVING COUNT(*) > 1;
   SELECT organization_id, name, COUNT(*) FROM inventory GROUP BY 1,2 HAVING COUNT(*) > 1;
   ```
3. Aplicar `20260515000003` (seguro)

---

## 9. Integrações Externas

| Integração | Status | Configuração necessária |
|---|---|---|
| Supabase Auth | ✅ | Em produção |
| Supabase Realtime | ✅ | Canal por `organization_id` |
| Evolution API (WhatsApp) | ✅ | Executar `scripts/setup-webhook.ts` uma vez para registrar o webhook |
| Vercel Cron | ✅ | `vercel.json` configurado para `0 18 * * *` (18h diário) |

**Ação:** Após deploy na Vercel, executar `npx tsx scripts/setup-webhook.ts` para registrar o webhook da Evolution API apontando para `https://<dominio>/api/webhook/evolution`.

---

## 10. Itens Fora do Escopo Deste Deploy (Tech Debt)

Ver `TECH_DEBT.md` para a lista completa. Destaques:

- `reports/queries.ts` (647 linhas) — não dividido, risco sem E2E
- 8 TODOs com dados hardcoded em `reports-page.tsx`
- `realtime-listener.tsx` sem retry em `CHANNEL_ERROR`
- Hooks `useLocalStorage` / `useDebounce` não centralizados

Nenhum desses itens bloqueia o deploy.

---

## Resumo de Ações Pré-Deploy

| # | Ação | Responsável | Bloqueante? |
|---|---|---|---|
| 1 | Confirmar `NEXT_PUBLIC_APP_URL` = domínio de produção | DevOps | ✅ Sim |
| 2 | Aplicar migrations `000000`, `000001`, `000003` | DBA | ✅ Sim |
| 3 | Verificar duplicatas e aplicar `000002` | DBA | ✅ Sim |
| 4 | Executar `scripts/setup-webhook.ts` após deploy | Dev | Não (WhatsApp opcional) |
| 5 | Configurar `RESEND_API_KEY` para email transacional | DevOps | Não (opcional) |
| 6 | Configurar `UPSTASH_REDIS_*` para rate limiting | DevOps | Não (opcional) |
