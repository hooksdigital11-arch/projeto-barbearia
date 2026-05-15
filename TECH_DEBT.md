# Tech Debt — Barbearia SaaS

Itens identificados na auditoria de arquitetura (2026-05-15) que não foram refatorados agora.
Cada item tem o motivo do adiamento.

---

## Alta Prioridade

### 1. Quebrar `reports/queries.ts` (647 linhas)
**Arquivo:** `src/features/reports/queries.ts`
**Problema:** Arquivo único com queries de receita, agendamentos, clientes, equipe e fidelidade.
**Ação:** Dividir em `revenue-queries.ts`, `appointments-queries.ts`, `clients-queries.ts`, `team-queries.ts`, `loyalty-queries.ts` e re-exportar de `queries.ts`.
**Por que não foi feito agora:** Alto risco de quebrar os imports dos componentes de reports sem testes E2E validando cada card.

---

### 2. TODOs sem dado real em `reports-page.tsx`
**Arquivo:** `src/features/reports/components/reports-page.tsx`
**Linhas:** 120, 121, 132, 133, 137, 165, 176, 200
**Problema:** 8 campos com `// TODO: conectar dado real` — `nome`, `barbeiro`, `pagamentosPendentes`, `valorPresente`, `categoria`, `concluidos`, `satisfacao`, `progressaoMedia` estão hardcoded ou ausentes.
**Ação:** Mapear cada campo no schema do banco e conectar via `reports/queries.ts`.
**Por que não foi feito agora:** Requer análise do schema de cada campo; risco de quebrar relatórios em produção sem dado de teste.

---

## Média Prioridade

### 3. Componentes grandes (300+ linhas) não quebrados
**Arquivos:**
- `src/features/admin-settings/components/appearance-settings.tsx` (484 linhas) — Extrair `ThemeConstants.ts`, `ThemePresets.ts` e `ThemeColorUtils.ts`
- `src/features/service/components/admin-services-page.tsx` (449 linhas) — Extrair `ServiceModal.tsx`, `ServiceList.tsx`
- `src/features/admin-settings/components/general-settings.tsx` (358 linhas) — Extrair `AddressSection.tsx`
- `src/features/clients/components/client-profile.tsx` (351 linhas) — Extrair `ClientTabs.tsx`, `LoyaltyTab.tsx`
- `src/features/messaging/components/template-modal.tsx` (341 linhas) — Extrair `TemplateEditor.tsx`
- `src/features/reports/components/reports-page.tsx` (331 linhas) — Extrair seções por tipo de report
- `src/features/inventory/components/inventory-page.tsx` (322 linhas) — Extrair `InventoryTable.tsx`, `InventoryFilters.tsx`
- `src/features/waiting-list/components/waiting-list-page-client.tsx` (301 linhas) — Extrair `QueueCard.tsx`
**Por que não foi feito agora:** Refatoração de componentes grandes requer testes visuais para garantir que nada quebre.

---

### 4. `formatCurrency` e `formatDate` duplicados em `client-profile.tsx`
**Arquivo:** `src/features/clients/components/client-profile.tsx`
**Linhas:** 45-56
**Problema:** `formatCurrency` redefinida inline (idêntica à `src/lib/utils/format-currency.ts`); `formatDate` com implementação diferente da centralizada.
**Ação:** Importar `formatCurrency` de `@/lib/utils/format-currency`; avaliar se a implementação local de `formatDate` deve substituir ou complementar a central.
**Por que não foi feito agora:** A implementação de `formatDate` local é diferente da centralizada — substituir sem confirmar o output visual poderia mudar a exibição de datas para o usuário.

---

### 5. `formatCurrency` duplicado em `admin-services-page.tsx`
**Arquivo:** `src/features/service/components/admin-services-page.tsx` (linha 33-34)
**Problema:** `formatPrice` definida inline, duplicando a lógica de `format-currency.ts`.
**Ação:** Importar `formatCurrency` de `@/lib/utils/format-currency`.
**Por que não foi feito agora:** O nome local é `formatPrice` (não `formatCurrency`), então a substituição requer rename além do import.

---

## Baixa Prioridade

### 6. Hooks customizados ausentes
**Problema:** Lógica de `localStorage` duplicada em 3 componentes (`appearance-settings`, `clients-page`, `team-page`) sem hook centralizado.
**Ação:** Criar `src/hooks/useLocalStorage.ts` e `src/hooks/useDebounce.ts`.
**Por que não foi feito agora:** Os 3 usos têm chaves diferentes e nenhum hook instalado — a criação seria nova infraestrutura, não remoção de dívida crítica.

### 7. `realtime-listener.tsx` sem tratamento de erro de reconexão
**Arquivo:** `src/components/shared/realtime-listener.tsx`
**Problema:** Se o canal Supabase cair, não há retry automático nem feedback para o usuário.
**Ação:** Adicionar handler para status `CHANNEL_ERROR` e `TIMED_OUT`.
**Por que não foi feito agora:** Mudança de comportamento de runtime — requer teste em ambiente de produção.

### 8. `appointment/actions.ts` (408 linhas) sem split por operação
**Arquivo:** `src/features/appointment/actions.ts`
**Problema:** Create, update, cancel, status change e cliente-self-book numa mesma action.
**Ação:** Dividir em `create-appointment.ts`, `update-appointment.ts`, `cancel-appointment.ts`.
**Por que não foi feito agora:** Quebraria todos os imports dos componentes que importam individualmente de `actions.ts`.

---

## Resolvido na auditoria

- ✅ Removido `console.log` de debug em `admin-settings/actions.ts`
- ✅ Removidos 2× `console.log` em `realtime-listener.tsx`
- ✅ Removido import `Sun` não utilizado em `appearance-settings.tsx`
- ✅ Substituídos 2× `window.location.reload()` por `router.refresh()` (admin-services-page + services-settings)
- ✅ Confirmado: todos os 148 `'use client'` são legítimos
- ✅ Confirmado: zero mock data hardcoded em páginas de produção
- ✅ Confirmado: zero funções utilitárias duplicadas (exceto os casos de client-profile listados acima)
- ✅ Confirmado: todas as Server Actions em arquivos separados (zero inline em .tsx)
