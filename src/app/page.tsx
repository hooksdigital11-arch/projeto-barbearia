import Link from 'next/link'
import { Scissors, Calendar, ChartBar, WhatsappLogo, Star, Users } from '@phosphor-icons/react/dist/ssr'

export const metadata = {
  title: 'BarberOS — Sistema de Gestão para Barbearias',
  description: 'Gerencie sua barbearia com agendamentos inteligentes, fidelidade e comanda digital.',
}

const features = [
  {
    icon: Calendar,
    title: 'Agendamento Online',
    description: 'Clientes agendam pelo app, você recebe confirmação automática.',
  },
  {
    icon: WhatsappLogo,
    title: 'WhatsApp Automático',
    description: 'Lembretes, confirmações e promoções enviadas sem esforço.',
  },
  {
    icon: Star,
    title: 'Programa de Fidelidade',
    description: 'Carimbos digitais que fidelizam e trazem clientes de volta.',
  },
  {
    icon: ChartBar,
    title: 'Relatórios em PDF',
    description: 'Dados de faturamento, equipe e clientes em um clique.',
  },
  {
    icon: Users,
    title: 'Multi-barbeiro',
    description: 'Gerencie toda a equipe com painéis individuais por barbeiro.',
  },
  {
    icon: Scissors,
    title: 'Comanda Digital',
    description: 'Feche atendimentos, aplique descontos e registre pagamentos.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-black text-text-primary">
      {/* Nav */}
      <nav className="border-b border-border-main px-6 py-4 flex items-center justify-between max-w-[1100px] mx-auto">
        <div className="flex items-center gap-2">
          <Scissors size={18} className="text-accent-main" weight="fill" />
          <span className="text-[14px] font-medium uppercase tracking-[0.1em]">BarberOS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-[11px] font-medium uppercase tracking-wider text-text-nav hover:text-text-secondary transition-colors px-4 py-2"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="text-[11px] font-medium uppercase tracking-wider bg-accent-main text-black px-4 py-2 rounded-[7px] hover:opacity-90 transition-all"
          >
            Começar Grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-[1100px] mx-auto px-6 pt-[80px] pb-[100px] text-center">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-main mb-6">
          Sistema de Gestão para Barbearias
        </p>
        <h1 className="text-[42px] sm:text-[64px] font-medium tracking-[-0.03em] leading-[1.05] uppercase mb-6">
          Gerencie sua<br />
          barbearia com<br />
          <span className="text-accent-main">precisão.</span>
        </h1>
        <p className="text-[13px] text-text-nav leading-[1.8] max-w-[480px] mx-auto mb-10 uppercase tracking-wide">
          Do agendamento ao fechamento da comanda. Tudo em um painel, para você focar no que importa.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="flex items-center gap-2 bg-accent-main text-black text-[12px] font-medium uppercase tracking-[0.08em] px-7 py-[14px] rounded-[8px] hover:opacity-90 transition-all"
          >
            Começar Grátis
          </Link>
          <Link
            href="/login"
            className="text-[12px] font-medium uppercase tracking-[0.08em] text-text-secondary border border-border-main px-7 py-[14px] rounded-[8px] hover:border-text-nav transition-all"
          >
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1100px] mx-auto px-6 pb-[100px]">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-nav mb-10 text-center">
          Tudo que você precisa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[10px]">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-bg-sidebar border border-border-main rounded-[10px] p-6 flex flex-col gap-4 hover:border-text-nav transition-all"
            >
              <div className="text-accent-main">
                <f.icon size={20} weight="regular" />
              </div>
              <div>
                <h3 className="text-[12px] font-medium uppercase tracking-wider text-text-primary mb-1">
                  {f.title}
                </h3>
                <p className="text-[11px] text-text-nav leading-[1.6]">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="border-t border-border-main">
        <div className="max-w-[1100px] mx-auto px-6 py-[80px] text-center">
          <h2 className="text-[32px] font-medium uppercase tracking-[-0.02em] mb-4">
            Pronto para começar<span className="text-accent-main">?</span>
          </h2>
          <p className="text-[12px] text-text-nav uppercase tracking-wide mb-8">
            Configure sua barbearia em minutos.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-accent-main text-black text-[12px] font-medium uppercase tracking-[0.08em] px-8 py-[14px] rounded-[8px] hover:opacity-90 transition-all"
          >
            Criar conta grátis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-main px-6 py-6 max-w-[1100px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors size={14} className="text-accent-main" weight="fill" />
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-nav">BarberOS</span>
        </div>
        <p className="text-[10px] text-text-muted uppercase tracking-wider">
          © {new Date().getFullYear()} — Sistema de Gestão
        </p>
      </footer>
    </div>
  )
}
