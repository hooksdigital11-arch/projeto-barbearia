# agente.md — Instruções Completas para Antigravity

Este arquivo define como o Antigravity deve gerar código para o projeto **Barbearia SaaS**.

---

## 🎯 PRINCÍPIOS FUNDAMENTAIS

### 1. Server Components por Padrão
Todos os componentes são **Server Components** por padrão.
Só use `'use client'` se PRECISAR de:
- Browser APIs (localStorage, window, etc)
- Event handlers (onClick, onChange)
- Hooks (useState, useEffect, useContext)

**Regra**: Se pode ser feito no servidor, FAÇA no servidor.

### 2. Data Access Layer (DAL) Obrigatório
- NUNCA acesse banco de dados direto em componentes
- Sempre passe por `features/[nome]/queries.ts`
- Toda query deve ter `'server-only'` no topo
- Usar `cache()` do React pra evitar queries duplicadas

### 3. Server Actions para Mutations
- Mutations (CREATE, UPDATE, DELETE) ficam em `features/[nome]/actions.ts`
- Todo action começa com `'use server'`
- Validar input com Zod antes de executar
- Retornar `{ error, issues? }` ou `{ success, data }`

### 4. Validação com Zod em TUDO
- Toda entrada de dados (formulários, API, etc) passa por Zod
- Schemas ficam em `features/[nome]/schemas.ts`
- Reusar schemas entre client (form validation) e server

### 5. TypeScript Strict, Sem Any
- `"strict": true` no tsconfig.json
- Nenhum `any`, `@ts-ignore`
- Tipos derivados de Zod quando possível

### 6. Feature-Based Organization
```
src/features/[feature_name]/
├── queries.ts        (DAL — 'server-only')
├── actions.ts        ('use server')
├── schemas.ts        (Zod)
├── types.ts          (TypeScript)
└── components/       (UI components)
```

---

## 🏗️ PADRÕES DE CÓDIGO

### Server Component (consumindo DAL)
```typescript
// src/app/(dashboard)/[feature]/page.tsx
import { Suspense } from 'react'
import { get[Feature]s } from '@/features/[feature]/queries'
import { [Feature]List } from '@/features/[feature]/components/[feature]-list'
import { [Feature]ListSkeleton } from '@/features/[feature]/components/[feature]-list-skeleton'

export default async function [Feature]Page() {
  return (
    <>
      <PageTitle title="[Feature]" />
      <Suspense fallback={<[Feature]ListSkeleton />}>
        <Content />
      </Suspense>
    </>
  )
}

async function Content() {
  const items = await get[Feature]s()
  return <[Feature]List items={items} />
}
```

### Data Access Layer (queries.ts)
```typescript
'use server'

import { cache } from 'react'
import { requireUser } from '@/lib/auth/require-auth'

export const get[Feature]s = cache(async () => {
  const user = await requireUser()
  
  // Query ao banco
  // Sempre filtrar por organization_id
  
  return data
})
```

### Server Action (actions.ts)
```typescript
'use server'

import { revalidatePath } from 'next/cache'
import { create[Feature]Schema } from './schemas'

export async function create[Feature](formData: FormData) {
  const user = await requireUser()
  
  const parsed = create[Feature]Schema.safeParse({...})

  if (!parsed.success) {
    return { error: 'Invalid data', issues: parsed.error.flatten() }
  }

  // INSERT ao banco

  revalidatePath('/[feature]')
  return { success: true, data }
}
```

### Zod Schemas (schemas.ts)
```typescript
import { z } from 'zod'

export const create[Feature]Schema = z.object({
  name: z.string().min(1).max(255),
}).strict() // Rejeita campos extras!

export type Create[Feature]Input = z.infer<typeof create[Feature]Schema>
```

### Client Component (apenas quando necessário)
```typescript
'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { create[Feature] } from '../actions'

export function Create[Feature]Form() {
  const [isPending, startTransition] = useTransition()
  const form = useForm<Create[Feature]Input>({
    resolver: zodResolver(create[Feature]Schema),
  })

  function onSubmit(data: Create[Feature]Input) {
    startTransition(async () => {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)))
      
      const result = await create[Feature](formData)
      
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('[Feature] created!')
      }
    })
  }

  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

---

## 🎨 DESIGN SYSTEM

### Tema: Antigravity Dark
```
Background: #0a0a0a (quase preto)
Secondary: #141414
Accent: #00e5ff (ciano neon)
Text: #ffffff
Muted: #a0a0a0
Success: #10b981
Error: #ef4444
```

### Fonts
- **Headings**: Syne (bold, moderno)
- **Body**: Inter / Tailwind default
- **Monospace**: DM Mono

### Componentes
- shadcn/ui v4
- Phosphor Icons (duotone)
- Tailwind CSS 4

### Cores dos Barbeiros
- Rafael: `#3b82f6` (azul)
- Thiago: `#f59e0b` (amarelo)
- Marcos: `#10b981` (verde)

---

## 🔒 SEGURANÇA (OBRIGATÓRIO)

### Em TODA feature:

1. **`'server-only'` em queries.ts**
   ```typescript
   'use server'
   ```

2. **`requireUser()` em actions.ts**
   ```typescript
   const user = await requireUser()
   ```

3. **Filtrar por `organization_id`**
   ```typescript
   .eq('organization_id', user.organization_id)
   ```

4. **Validar com Zod**
   ```typescript
   const parsed = schema.safeParse(input)
   if (!parsed.success) return { error: '...' }
   ```

5. **Nunca retornar senhas/tokens**
   ```typescript
   .select('id, name, email') // Sem campos sensíveis
   ```

---

## 📊 DATABASE REFERENCE

### Tabelas principais:
- `profiles` — usuários (admin, barber)
- `organizations` — barbearias
- `services` — serviços (corte, barba)
- `clients` — clientes
- `appointments` — agendamentos
- `waiting_list` — fila de espera
- `loyalty_stamps` — carimbos/fidelidade
- `comanda_items` — vendas avulsas
- `messages` — mensageria
- `inventory` — estoque
- `activity_log` — auditoria

**Sempre verificar RLS policies** — ninguém vê dados de outro org.

---

## 🚀 PERFORMANCE

### Server Components — Paralelo quando possível
```typescript
const [appointments, clients] = await Promise.all([
  getAppointments(),
  getClients(),
])
```

### Suspense boundaries
```typescript
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

### next/image pra imagens
```typescript
import Image from 'next/image'
<Image src="..." alt="..." width={48} height={48} />
```

### Cache React
```typescript
export const getData = cache(async () => {
  // Roda 1x por request, mesmo se múltiplos componentes chamarem
})
```

---

## 📝 NAMING CONVENTIONS

### Pastas (kebab-case)
- `src/features/waiting-list/`
- Não pluralizar: `appointment/` (não `appointments`)

### Arquivos
- **Kebab-case**: `appointment-card.tsx`
- **Actions**: `actions.ts`
- **Queries**: `queries.ts`
- **Validation**: `schemas.ts`
- **Types**: `types.ts`

### Componentes (PascalCase)
- Server: `AppointmentList`, `ClientCard`
- Client: `AppointmentFilter`, `CreateForm`

### Funções (camelCase)
- `getAppointments()`, `createAppointment()`
- `formatCurrency()`, `hashColor()`

---

## ❌ ANTIPADRÕES (NÃO FAÇA)

- ❌ Buscar dados em `useEffect` quando pode ser Server Component
- ❌ Criar API Route quando Server Action resolve
- ❌ Acessar banco direto no componente (usa DAL)
- ❌ Esquecer `'use server'` / `'server-only'`
- ❌ Retornar TODOS campos do banco (usa `.select()`)
- ❌ Usar `any` em TypeScript
- ❌ Hardcode de cores (usa CSS variables)
- ❌ Re-criar componentes compartilhados
- ❌ Esquecer Suspense boundaries
- ❌ Misturar lógica de negócio na página (usa features/)
- ❌ API Routes sem necessidade real
- ❌ `useEffect` pra algo synchronous

---

## 🧪 TESTES

### Unit (Vitest)
- Schemas Zod
- Utility functions
- Custom hooks

### Integration
- Server Actions
- Queries (mock Supabase)

### E2E (Playwright)
- Login flow
- Agendar cliente
- Adicionar à fila

---

## 📋 COMPONENTES COMPARTILHADOS (REUSAR SEMPRE)

```
src/components/shared/
├── page-layout.tsx         — Wrapper de página
├── page-title.tsx          — Título + subtítulo
├── kpi-card.tsx            — Cards de KPI
├── client-avatar.tsx       — Avatar com hash color
├── empty-state.tsx         — Estado vazio
├── data-table.tsx          — Tabela genérica
└── loading-spinner.tsx     — Spinner
```

Sempre verificar se existe antes de criar novo!

---

## ✅ DEFINITION OF DONE

Não considera "pronta" antes de:

- [ ] `pnpm type-check` passa
- [ ] `pnpm lint` passa
- [ ] `pnpm build` passa
- [ ] Funciona no mobile (responsividade)
- [ ] Estados de loading + error
- [ ] Empty states
- [ ] RLS verificado
- [ ] Zod validation presente
- [ ] Componentes compartilhados reutilizados
- [ ] Sem `console.log` de debug
- [ ] Sem `any` types
- [ ] Sem hardcodes

---

## 🔄 FLUXO DE DESENVOLVIMENTO

### Para criar uma nova feature:

1. **Defina o schema Zod** (`features/[feature]/schemas.ts`)
2. **Crie os tipos** (`features/[feature]/types.ts`)
3. **Implemente queries (DAL)** (`features/[feature]/queries.ts`)
4. **Implemente actions** (`features/[feature]/actions.ts`)
5. **Crie página Server** (`app/(dashboard)/[feature]/page.tsx`)
6. **Crie componentes** (`features/[feature]/components/`)
7. **Adicione testes** (`tests/`)
8. **Commit** (passar no checklist acima)

---

## 📞 REFERÊNCIAS

- [Next.js 15 Docs](https://nextjs.org)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [shadcn/ui](https://ui.shadcn.com)
- [Zod](https://zod.dev)
- [Supabase](https://supabase.com/docs)

---

## 🎯 RESUMO RÁPIDO

**5 regras de ouro:**

1. ✅ **Server Components por padrão** (só `'use client'` se precisar)
2. ✅ **DAL em `features/[nome]/queries.ts`** (nunca acessa banco no componente)
3. ✅ **Server Actions em `features/[nome]/actions.ts`** (mutations seguras)
4. ✅ **Zod em TUDO** (validação rigorosa)
5. ✅ **Filtro `organization_id` em TODAS queries** (segurança multi-tenant)

---

**Última atualização**: 03/05/2026
**Versão**: 2.0
**Stack**: Next.js 15 + React 19 + TypeScript + Supabase