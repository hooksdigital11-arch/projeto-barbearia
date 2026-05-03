# Barbearia SaaS — Arquitetura & Stack 2026

Bem-vindo ao projeto **Barbearia SaaS**. Este projeto foi inicializado seguindo as diretrizes mais rigorosas de arquitetura moderna (Next.js 15, React 19, Supabase).

## 🚀 Tecnologias

- **Framework**: Next.js 15 (App Router + Turbopack)
- **UI**: Tailwind CSS 4 + Radix UI + Phosphor Icons
- **Backend**: Supabase (Auth, DB, Realtime)
- **Estilização**: Glassmorphism & Dark Mode Premium
- **Tipagem**: TypeScript Strict
- **Validação**: Zod + React Hook Form

## 📁 Estrutura de Pastas

- `src/app`: Rotas e layouts (App Router)
- `src/features`: Lógica dividida por domínios (Agendamentos, Clientes, etc.)
- `src/lib`: Infraestrutura e utilitários (Supabase, Auth, Utils)
- `src/components`: Componentes compartilhados e UI

## 🛠️ Padrões de Desenvolvimento

1. **DAL (Data Access Layer)**: Todas as buscas de dados no servidor devem estar em `queries.ts` nas pastas de features, usando `cache()` e `server-only`.
2. **Server Actions**: Todas as mutações devem usar Server Actions.
3. **Zod**: Validação obrigatória para todos os dados de entrada.
4. **Strict TS**: Proibido o uso de `any`.

## 🎨 Design System

- **Fontes**: Syne (Headers) & DM Mono (Interface/Dados)
- **Tema**: Focado em Dark Mode premium com acentos em Cyan e cores específicas para barbeiros.
- **Efeitos**: Glassmorphism em containers principais.

---

*Inicializado por Antigravity (Google DeepMind)*
# projeto-barbearia
