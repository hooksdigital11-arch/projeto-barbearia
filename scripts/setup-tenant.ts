/**
 * Cria um novo tenant (organização + admin + serviços padrão) no Supabase.
 *
 * Uso:
 *   npx ts-node scripts/setup-tenant.ts \
 *     --name "Barbearia Exemplo" \
 *     --email "admin@exemplo.com" \
 *     --password "senha123"
 *
 * Variáveis de ambiente necessárias:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

function parseArgs() {
  const args = process.argv.slice(2)
  const get = (flag: string) => {
    const i = args.indexOf(flag)
    return i !== -1 ? args[i + 1] : undefined
  }
  const name = get('--name')
  const email = get('--email')
  const password = get('--password')
  if (!name || !email || !password) {
    console.error('Uso: setup-tenant.ts --name "Nome" --email "email" --password "senha"')
    process.exit(1)
  }
  return { name, email, password }
}

const DEFAULT_SERVICES = [
  { name: 'Corte Masculino', description: 'Corte tradicional ou moderno', duration_minutes: 30, price_cents: 3500, category: 'corte', is_active: true },
  { name: 'Barba', description: 'Barba com navalha e toalha quente', duration_minutes: 30, price_cents: 2500, category: 'barba', is_active: true },
  { name: 'Corte + Barba', description: 'Combo corte e barba', duration_minutes: 60, price_cents: 5500, category: 'combo', is_active: true },
  { name: 'Pigmentação de Barba', description: 'Coloração e pigmentação', duration_minutes: 45, price_cents: 4500, category: 'outros', is_active: true },
]

async function main() {
  const { name, email, password } = parseArgs()

  console.log(`\nConfigurando tenant: "${name}"`)
  console.log('─'.repeat(40))

  // 1. Criar organização
  console.log('1. Criando organização...')
  const { data: org, error: orgErr } = await supabase
    .from('organizations')
    .insert({ name, plan: 'starter' })
    .select('id, name')
    .single()

  if (orgErr || !org) {
    console.error('Erro ao criar organização:', orgErr?.message)
    process.exit(1)
  }
  console.log(`   ✓ Organização criada: ${org.id}`)

  // 2. Criar usuário admin via Auth
  console.log('2. Criando usuário admin...')
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Admin', organization_id: org.id },
  })

  if (authErr || !authData.user) {
    console.error('Erro ao criar usuário:', authErr?.message)
    // Rollback: delete org
    await supabase.from('organizations').delete().eq('id', org.id)
    process.exit(1)
  }
  const userId = authData.user.id
  console.log(`   ✓ Usuário criado: ${userId}`)

  // 3. Upsert profile com org e role=admin
  // (O trigger do Supabase pode ter criado um profile sem org_id — fazemos upsert)
  console.log('3. Configurando profile de admin...')
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email,
      full_name: 'Admin',
      role: 'admin',
      organization_id: org.id,
    })

  if (profileErr) {
    console.error('Erro ao atualizar profile:', profileErr.message)
    process.exit(1)
  }
  console.log('   ✓ Profile configurado como admin')

  // 4. Seed serviços padrão
  console.log('4. Criando serviços padrão...')
  const { error: servicesErr } = await supabase
    .from('services')
    .insert(DEFAULT_SERVICES.map(s => ({ ...s, organization_id: org.id })))

  if (servicesErr) {
    console.error('Erro ao criar serviços:', servicesErr.message)
    process.exit(1)
  }
  console.log(`   ✓ ${DEFAULT_SERVICES.length} serviços criados`)

  console.log('\n' + '─'.repeat(40))
  console.log('Tenant configurado com sucesso!')
  console.log(`  Organização : ${org.name} (${org.id})`)
  console.log(`  Admin email : ${email}`)
  console.log(`  Login em    : ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`)
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
