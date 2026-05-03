import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { env } from '@/env/server'

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
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser()

  // Se estiver na root e logado, redireciona para o dashboard correto
  if (user && request.nextUrl.pathname === '/') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const role = profile.role
      const url = new URL(role === 'admin' ? '/admin' : role === 'barber' ? '/barber' : '/client', request.url)
      return NextResponse.redirect(url)
    }
  }

  // Se NÃO estiver logado e tentar acessar root em produção, vai para login
  if (!user && request.nextUrl.pathname === '/' && process.env.NODE_ENV !== 'development') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
