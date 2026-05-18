import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="max-w-md space-y-8">
        <p className="text-[120px] font-bold leading-none text-accent-main select-none">404</p>
        <div className="space-y-3">
          <h1 className="text-2xl font-medium uppercase tracking-widest text-text-primary">Página não encontrada</h1>
          <p className="text-text-muted text-sm">
            O link que você acessou não existe ou foi removido.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-accent-main text-black font-medium text-sm uppercase tracking-wider rounded-[10px] hover:opacity-90 transition-opacity"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
