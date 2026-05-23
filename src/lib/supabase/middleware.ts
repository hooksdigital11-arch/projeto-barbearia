import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env/server'
import { supabaseAdmin } from './admin'

/**
 * Rotas que NÃO precisam de autenticação.
 */
const publicRoutes = ['/', '/login', '/signup', '/recovery', '/auth/callback']

function isPublicRoute(pathname: string): boolean {
  if (pathname === '/') return true
  return publicRoutes.some((route) => route !== '/' && pathname.startsWith(route))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            supabaseResponse.cookies.set(name, value, options as any)
          )
        },
      },
    }
  )

  // Refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()

  // ========================================
  // PROTEÇÃO DE ROTAS (toda lógica de auth)
  // ========================================

  const pathname = request.nextUrl.pathname

  // 1. Usuário NÃO logado tentando acessar rota protegida → vai pro login
  if (!user && !isPublicRoute(pathname)) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Usuário LOGADO tentando acessar rota pública (login/signup) → redireciona pro dashboard
  if (user && isPublicRoute(pathname) && pathname !== '/auth/callback') {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as { role: string } | null)?.role || 'client'
    const dashboardUrl = new URL(
      role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client',
      request.url
    )
    return NextResponse.redirect(dashboardUrl)
  }

  // 3. Usuário logado na root → redireciona pro dashboard correto
  if (user && pathname === '/') {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = (profile as { role: string } | null)?.role || 'client'
    const dashboardUrl = new URL(
      role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client',
      request.url
    )
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}
