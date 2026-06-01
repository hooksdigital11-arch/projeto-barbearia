import Link from 'next/link'
import {
  Scissors,
  WhatsappLogo,
  ArrowRight,
  CheckCircle,
  X,
  Warning,
  CurrencyDollar,
  Clock,
  ShieldCheck,
  Storefront,
} from '@phosphor-icons/react/dist/ssr'
import { LandingNav } from '@/features/landing/components/landing-nav'
import { LandingFaq } from '@/features/landing/components/landing-faq'
import { LandingAnimations } from '@/features/landing/components/landing-animations'
import { LandingTicker } from '@/features/landing/components/landing-ticker'
import { LandingHorizontal } from '@/features/landing/components/landing-horizontal'
import { LandingGallery } from '@/features/landing/components/landing-gallery'
import { LandingFeaturesSlider } from '@/features/landing/components/landing-features-slider'
import { LandingIntro } from '@/features/landing/components/landing-intro'
import { CursorTrail } from '@/features/landing/components/cursor-trail'

export const metadata = {
  title: 'BarberOS — Sistema de Gestão sem Mensalidade',
  description:
    'O único sistema completo para barbearias sem mensalidade. Pague a implementação e hospedagem anual. Agendamento, WhatsApp automático, fidelidade e muito mais.',
}

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { display: '2.400+', value: 2400,  suffix: '+', prefix: '',    label: 'Agendamentos processados', animated: true },
  { display: '98%',    value: 98,    suffix: '%', prefix: '',    label: 'Taxa de satisfação',        animated: true },
  { display: '70%',    value: 70,    suffix: '%', prefix: '',    label: 'Redução de no-show',        animated: true },
  { display: 'R$0',    value: null,  suffix: '',  prefix: 'R$',  label: 'Mensalidade cobrada',       animated: false },
]

const pains = [
  {
    icon: CurrencyDollar,
    title: 'Mensalidade que nunca para',
    text: 'Concorrentes cobram de R$79 a R$150 por mês. Todo mês. Para sempre. Não importa se você usou ou não.',
  },
  {
    icon: WhatsappLogo,
    title: 'WhatsApp virando caos',
    text: '"Tem vaga pra hoje?" — dezenas de mensagens por dia, respondidas manualmente, enquanto você tenta trabalhar.',
  },
  {
    icon: Clock,
    title: 'Clientes que não aparecem',
    text: 'Sem lembrete automático, até 30% dos agendamentos viram no-show. Cadeira vazia, tempo perdido, dinheiro no lixo.',
  },
  {
    icon: Warning,
    title: 'Você não é dono dos seus dados',
    text: 'Parou de pagar? Perdeu o acesso. Na maioria dos sistemas os dados são deles — não seus. Isso é sequestro digital.',
  },
]


const steps = [
  { number: '01', title: 'Você escolhe o plano',     text: 'Nos chama no WhatsApp, escolhemos juntos o melhor plano pro tamanho da sua barbearia.' },
  { number: '02', title: 'Implementamos em 48h',     text: 'Nossa equipe configura tudo: barbearia, barbeiros, serviços e horários. Você não precisa fazer nada.' },
  { number: '03', title: 'Seu sistema, para sempre', text: 'Começa a usar e nunca mais se preocupa com mensalidade. Só renova a hospedagem uma vez por ano.' },
]

const plans = [
  {
    name: 'Starter',
    subtitle: '1 a 2 barbeiros',
    impl: 'R$997',
    annual: 'R$397',
    monthly: 'R$33',
    highlight: false,
    features: ['Agendamento online ilimitado', 'WhatsApp automático', 'Comanda digital', 'Relatórios básicos', 'Suporte por chat', '1 localização'],
  },
  {
    name: 'Profissional',
    subtitle: '3 a 6 barbeiros',
    impl: 'R$1.497',
    annual: 'R$597',
    monthly: 'R$50',
    highlight: true,
    features: ['Tudo do Starter', 'Programa de fidelidade', 'Relatórios completos', 'Gestão de equipe', 'Fila de espera', 'Suporte prioritário'],
  },
  {
    name: 'Studio',
    subtitle: '7+ barbeiros',
    impl: 'R$1.997',
    annual: 'R$897',
    monthly: 'R$75',
    highlight: false,
    features: ['Tudo do Profissional', 'Multi-unidades', 'API WhatsApp dedicada', 'Relatórios avançados', 'Migração de dados inclusa', 'Suporte via chamada'],
  },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      <LandingIntro />
      <CursorTrail />
      <LandingAnimations />

      {/* ════════ HERO ════════ */}
      <section className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 55% at 50% -5%, rgba(0,212,170,0.09) 0%, transparent 58%),' +
              'radial-gradient(ellipse 55% 45% at 88% 90%, rgba(0,212,170,0.04) 0%, transparent 55%),' +
              '#0a0a0a',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.032,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '175px 175px',
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none" />

        <LandingNav />

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6 -mt-16">

          {/* Badge */}
          <div
            data-gsap="hero-badge"
            className="inline-flex items-center gap-2 border border-accent-main/20 bg-accent-main/5 rounded-full px-4 py-[7px] mb-8"
          >
            <div className="w-[5px] h-[5px] rounded-full bg-accent-main lp-glow-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-[0.38em] text-accent-main">
              Zero mensalidade mensal
            </span>
          </div>

          {/* Headline */}
          <h1 data-gsap="hero-headline" className="font-syne uppercase select-none">
            <span
              className="block font-medium leading-none"
              style={{ fontSize: 'clamp(3.2rem, 12vw, 9rem)', color: 'rgba(255,255,255,0.10)', letterSpacing: '-0.04em', lineHeight: 1 }}
            >
              Sua barbearia.
            </span>
            <span
              className="block font-medium leading-none"
              style={{ fontSize: 'clamp(3.2rem, 12vw, 9rem)', color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1, marginTop: '-0.08em' }}
            >
              Sem mensalidade.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            data-gsap="hero-sub"
            className="mt-9 font-mono text-[11px] sm:text-[12px] text-white/38 uppercase tracking-[0.22em] max-w-[340px] sm:max-w-[420px] leading-[2.1]"
          >
            O único sistema completo para barbearias onde você paga a implementação e uma hospedagem anual.
            <br className="hidden sm:block" />
            Sem cobranças mensais. Sem surpresas.
          </p>

          {/* CTAs */}
          <div data-gsap="hero-ctas" className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#planos"
              className="font-mono text-[10px] uppercase tracking-[0.18em] bg-accent-main text-black font-medium px-7 py-[13px] rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Ver planos
            </a>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/50 border border-white/[0.11] px-7 py-[13px] rounded-full hover:border-white/30 hover:text-white/80 transition-all duration-300"
            >
              Falar com especialista
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div data-gsap="hero-scroll" className="absolute bottom-9 left-1/2 -translate-x-1/2 opacity-20 animate-pulse">
          <div className="w-px h-9 bg-white/50 mx-auto" />
        </div>
      </section>

      {/* ════════ PROOF BAR ════════ */}
      <section className="border-y border-white/[0.05] relative">
        {/* Animated teal accent line */}
        <div
          data-gsap="proof-accent"
          className="absolute top-0 left-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-accent-main/50 to-transparent"
        />
        <div
          data-gsap-stagger
          data-stagger="0.09"
          className="max-w-[900px] mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((s) => (
            <div data-gsap-child key={s.label} className="text-center">
              <p
                data-gsap={s.animated ? 'counter' : 'fade-up'}
                data-value={s.animated && s.value !== null ? s.value : undefined}
                data-suffix={s.animated ? s.suffix : undefined}
                data-prefix={s.animated ? s.prefix : undefined}
                className="font-syne font-medium text-white mb-1"
                style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', letterSpacing: '-0.03em' }}
              >
                {s.display}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/28">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ PAIN POINTS ════════ */}
      <section className="max-w-[900px] mx-auto px-6 py-[100px]">
        <div className="text-center mb-14">
          <p data-gsap="fade-up" className="font-mono text-[9px] uppercase tracking-[0.38em] text-accent-main mb-4">O problema</p>
          <h2
            data-gsap="line-reveal"
            className="font-syne font-medium uppercase leading-[0.9] tracking-[-0.03em] text-white"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Quanto você paga<br />
            <span className="text-white/25">pra não ser dono do sistema?</span>
          </h2>
        </div>

        <div data-gsap-stagger data-stagger="0.1" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pains.map((pain) => (
            <div data-gsap-child key={pain.title} className="group border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] hover:bg-white/[0.02] transition-all duration-500 h-full">
              <div className="flex items-start gap-4">
                <div className="text-red-400/50 group-hover:text-red-400/80 transition-colors duration-300 shrink-0 mt-[2px]">
                  <pain.icon size={18} weight="regular" />
                </div>
                <div>
                  <h3 className="font-syne text-[12px] font-medium uppercase tracking-[0.08em] text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-2">
                    {pain.title}
                  </h3>
                  <p className="font-mono text-[10px] text-white/28 leading-[1.9]">{pain.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ DIFFERENTIATOR ════════ */}
      <section className="border-t border-white/[0.05] bg-[#0d0d0d]">
        <div className="max-w-[900px] mx-auto px-6 py-[100px]">
          <div className="text-center mb-14">
            <p data-gsap="fade-up" className="font-mono text-[9px] uppercase tracking-[0.38em] text-accent-main mb-4">O diferencial</p>
            <h2
              data-gsap="line-reveal"
              className="font-syne font-medium uppercase leading-[0.9] tracking-[-0.03em] text-white"
              style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
            >
              Eles cobram todo mês.<br />
              <span className="text-accent-main">Nós cobramos uma vez.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Concorrentes */}
            <div data-gsap="slide-left" className="border border-red-500/15 rounded-2xl p-7 bg-red-500/[0.03] h-full">
              <div className="flex items-center gap-2 mb-6">
                <X size={14} className="text-red-400/70" weight="bold" />
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-red-400/60">Outros sistemas</p>
              </div>
              <div className="space-y-3">
                {['R$79–150 por mês, todo mês, para sempre', 'Preço pode subir a qualquer momento', 'Parou de pagar, perdeu o acesso', 'Seus dados ficam com eles', 'Suporte cobrado à parte', 'Contratos com fidelidade'].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <X size={12} className="text-red-400/50 shrink-0 mt-[3px]" weight="bold" />
                    <p className="font-mono text-[10px] text-white/30 leading-[1.7]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-red-500/10">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 mb-1">Custo em 3 anos</p>
                <p className="font-syne text-[2rem] font-medium text-red-400/60 tracking-[-0.03em]">R$2.844+</p>
                <p className="font-mono text-[9px] text-white/20">considerando R$79/mês</p>
              </div>
            </div>

            {/* BarberOS */}
            <div data-gsap="slide-right" className="border border-accent-main/20 rounded-2xl p-7 bg-accent-main/[0.04] relative overflow-hidden h-full">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,212,170,0.07) 0%, transparent 70%)' }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-6">
                  <CheckCircle size={14} className="text-accent-main" weight="fill" />
                  <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent-main">BarberOS</p>
                </div>
                <div className="space-y-3">
                  {['Implementação única + hospedagem anual fixa', 'Preço anual nunca muda sem aviso prévio', 'Seus dados são seus, sempre exportáveis', 'Suporte incluso na hospedagem', 'Sem fidelidade, sem multa', 'Migração de dados inclusa'].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle size={12} className="text-accent-main shrink-0 mt-[3px]" weight="fill" />
                      <p className="font-mono text-[10px] text-white/50 leading-[1.7]">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-accent-main/10">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/20 mb-1">A partir do 2º ano</p>
                  <p className="font-syne text-[2rem] font-medium text-accent-main tracking-[-0.03em]">R$33/mês</p>
                  <p className="font-mono text-[9px] text-white/20">equivalente (plano Starter)</p>
                </div>
              </div>
            </div>
          </div>

          <p data-gsap="fade-up" className="mt-8 text-center font-mono text-[10px] text-white/20 uppercase tracking-[0.2em]">
            A partir do segundo ano, você paga apenas a hospedagem. Nada mais.
          </p>
        </div>
      </section>

      {/* ════════ TICKER (between differentiator and features) ════════ */}
      <LandingTicker />

      {/* ════════ FEATURES ════════ */}
      <LandingFeaturesSlider />

      {/* ════════ HOW IT WORKS ════════ */}
      <section className="border-t border-white/[0.05] bg-[#0d0d0d]">
        <div className="max-w-[900px] mx-auto px-6 py-[100px]">
          <div data-gsap="fade-up" className="flex items-center gap-5 mb-[60px]">
            <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent-main whitespace-nowrap">Como funciona</p>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <div data-gsap-stagger data-stagger="0.13" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div data-gsap-child key={step.number}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full border border-accent-main/25 flex items-center justify-center shrink-0 hover:border-accent-main/60 hover:bg-accent-main/5 transition-colors duration-300">
                    <span className="font-mono text-[9px] text-accent-main">{step.number}</span>
                  </div>
                  <div className="h-px flex-1 bg-white/[0.05] md:hidden" />
                </div>
                <h3 className="font-syne text-[13px] font-medium uppercase tracking-[0.07em] text-white/80 mb-3">{step.title}</h3>
                <p className="font-mono text-[10px] text-white/28 leading-[1.9]">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ APP GALLERY ════════ */}
      <LandingGallery />

      {/* ════════ PRICING ════════ */}
      <section id="planos" className="max-w-[900px] mx-auto px-6 py-[100px]">
        <div className="text-center mb-14">
          <p data-gsap="fade-up" className="font-mono text-[9px] uppercase tracking-[0.38em] text-accent-main mb-4">Planos</p>
          <h2
            data-gsap="line-reveal"
            className="font-syne font-medium uppercase leading-[0.9] tracking-[-0.03em] text-white mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
          >
            Transparente.<br />
            <span className="text-white/25">Sem letras miúdas.</span>
          </h2>
          <p data-gsap="word-reveal" className="font-mono text-[10px] text-white/28 uppercase tracking-[0.2em] max-w-md mx-auto leading-[2]">
            Implementação única + hospedagem anual. É o que você paga. Ponto final.
          </p>
        </div>

        <div data-gsap-pricing className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <div
              data-gsap-pricing-card
              key={plan.name}
              className={`relative rounded-2xl p-7 border transition-all duration-300 h-full flex flex-col ${
                plan.highlight
                  ? 'border-accent-main/30 bg-accent-main/[0.04]'
                  : 'border-white/[0.07] hover:border-white/[0.12] hover:bg-white/[0.02]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="font-mono text-[8px] uppercase tracking-[0.25em] lp-badge-shimmer px-3 py-[5px] rounded-full border border-accent-main/30 bg-[#0a0a0a]">
                    Mais popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-syne text-[15px] font-medium uppercase tracking-[0.08em] text-white mb-1">{plan.name}</h3>
                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-white/30">{plan.subtitle}</p>
              </div>

              <div className="mb-2">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 mb-1">Implementação</p>
                <p className="font-syne text-[1.6rem] font-medium text-white tracking-[-0.03em]">{plan.impl}</p>
                <p className="font-mono text-[9px] text-white/20">pagamento único</p>
              </div>

              <div className="mt-5 mb-6 pt-5 border-t border-white/[0.06]">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25 mb-1">Hospedagem anual</p>
                <p className="font-syne text-[1.4rem] font-medium text-white tracking-[-0.03em]">
                  {plan.annual}<span className="text-[0.8rem] text-white/40">/ano</span>
                </p>
                <p className="font-mono text-[9px] text-accent-main/70">≈ {plan.monthly}/mês equivalente</p>
              </div>

              <div className="space-y-2.5 mb-8 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5">
                    <CheckCircle size={11} className={plan.highlight ? 'text-accent-main' : 'text-white/25'} weight="fill" />
                    <span className="font-mono text-[10px] text-white/40">{f}</span>
                  </div>
                ))}
              </div>

              <a
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full font-mono text-[10px] uppercase tracking-[0.18em] font-medium py-[13px] rounded-full text-center transition-all duration-300 ${
                  plan.highlight
                    ? 'bg-accent-main text-black hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]'
                    : 'border border-white/[0.10] text-white/50 hover:text-white/80 hover:border-white/20'
                }`}
              >
                Começar agora
              </a>
            </div>
          ))}
        </div>

        <div data-gsap="fade-up" className="mt-8 flex items-center gap-4 justify-center">
          <ShieldCheck size={13} className="text-white/20" />
          <p className="font-mono text-[9px] text-white/20 uppercase tracking-[0.2em]">
            Sem contrato de fidelidade · Dados sempre exportáveis · Migração inclusa
          </p>
        </div>
      </section>

      {/* ════════ TICKER ════════ */}
      <LandingTicker />

      {/* ════════ HORIZONTAL SCROLL (Testimonials) ════════ */}
      <LandingHorizontal />

      {/* ════════ FAQ ════════ */}
      <section id="faq" className="max-w-[900px] mx-auto px-6 py-[100px]">
        <div data-gsap="fade-up" className="flex items-center gap-5 mb-[60px]">
          <p className="font-mono text-[9px] uppercase tracking-[0.35em] text-accent-main whitespace-nowrap">Dúvidas frequentes</p>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>
        <div data-gsap="fade-up" data-delay="100">
          <LandingFaq />
        </div>
      </section>

      {/* ════════ FINAL CTA ════════ */}
      <section className="relative border-t border-white/[0.05] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 85% 65% at 50% 110%, rgba(0,212,170,0.06) 0%, transparent 65%)' }}
        />
        <div className="relative max-w-[900px] mx-auto px-6 py-[120px] text-center">
          <div data-gsap="fade-up" className="inline-flex items-center gap-2 border border-accent-main/20 bg-accent-main/5 rounded-full px-4 py-[7px] mb-8">
            <Storefront size={11} className="text-accent-main" />
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-accent-main">Para donos de barbearia</span>
          </div>

          <h2
            data-gsap="fade-up"
            className="font-syne font-medium uppercase leading-[0.88] tracking-[-0.035em] text-white mb-6"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5.5rem)' }}
          >
            Pare de pagar<br />
            <span className="text-accent-main">mensalidade.</span>
          </h2>

          <p data-gsap="fade-up" className="font-mono text-[10px] text-white/28 uppercase tracking-[0.22em] mb-12 leading-[2.1] max-w-sm mx-auto">
            Implementação em 48h. Suporte incluso.<br />Seus dados, sempre seus.
          </p>

          <div data-gsap="fade-up" className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="#planos"
              className="inline-flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] bg-accent-main text-black font-medium px-10 py-4 rounded-full hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              Ver os planos
              <ArrowRight size={12} weight="bold" />
            </a>
            <a
              href="https://wa.me/5500000000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 border border-white/[0.11] px-8 py-4 rounded-full hover:border-white/30 hover:text-white/75 transition-all duration-300"
            >
              <WhatsappLogo size={13} />
              Falar agora
            </a>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-white/[0.05] px-6 py-8">
        <div className="max-w-[900px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-[7px]">
            <Scissors size={12} className="text-accent-main" weight="fill" />
            <span className="font-syne text-[11px] font-semibold uppercase tracking-[0.22em] text-white/25">BarberOS</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/18 hover:text-white/40 transition-colors">Entrar</Link>
            <Link href="/signup" className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/18 hover:text-white/40 transition-colors">Criar conta</Link>
          </div>
          <p className="font-mono text-[9px] text-white/12 uppercase tracking-wider">© {new Date().getFullYear()} BarberOS</p>
        </div>
      </footer>
    </div>
  )
}
