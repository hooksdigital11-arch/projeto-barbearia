# Barbearia SaaS

Aplicação web para gestão de barbearia, com áreas para administração, barbeiros e clientes. Inclui agenda, cadastro de clientes e serviços, fila de espera, comandas, estoque, fidelidade e relatórios.

## Stack

- Next.js 16 com App Router e React 19
- TypeScript
- Tailwind CSS 4 e componentes Radix UI
- Supabase para autenticação e dados
- Zod para validação

## Executar localmente

Use Node.js 20.9 ou superior. Instale as dependências:

```bash
npm ci
```

Crie um arquivo `.env.local` na raiz com as credenciais do seu ambiente Supabase e a URL local da aplicação. As variáveis necessárias estão declaradas em `src/env/server.ts`; mantenha `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor e nunca envie credenciais para o Git.

Depois inicie o servidor:

```bash
npm run dev
```

Abra `http://localhost:3000`.

## Verificações

```bash
npm run test -- --run
npm run type-check
npm run lint
npm run build
```

Os testes precisam das variáveis de ambiente do Supabase. Para executar a suíte sem uma conta real, use valores fictícios apenas no ambiente local de teste.
