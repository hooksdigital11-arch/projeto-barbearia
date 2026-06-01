'use client'

import { useState } from 'react'
import { Plus, Minus } from '@phosphor-icons/react'

const faqs = [
  {
    q: 'O que está incluso na implementação?',
    a: 'Tudo que você precisa pra começar: configuração completa do sistema, cadastro da sua barbearia, barbeiros e serviços, treinamento ao vivo com nossa equipe e suporte prioritário nos primeiros 30 dias. Você entra funcionando.',
  },
  {
    q: 'O suporte é cobrado à parte?',
    a: 'Não. Suporte por WhatsApp e chat está incluso na hospedagem anual. Nossa equipe responde em até 2 horas em dias úteis. Sem cobranças extras por atendimento.',
  },
  {
    q: 'E se eu não renovar a hospedagem no ano seguinte?',
    a: 'Seus dados continuam sendo seus. Antes de encerrar, fornecemos exportação completa de tudo — clientes, histórico de agendamentos, financeiro — em formato padrão. Você nunca fica refém do sistema.',
  },
  {
    q: 'Consigo migrar de outro sistema sem perder dados?',
    a: 'Sim. Nossa equipe faz a migração dos seus clientes e histórico do sistema atual. Sem retrabalho, sem digitar tudo de novo. A migração está inclusa na implementação.',
  },
  {
    q: 'Funciona no celular? Precisa baixar aplicativo?',
    a: 'Funciona em qualquer dispositivo com navegador: celular, tablet ou computador. Não precisa instalar nada. Seus clientes agendam por link, você gerencia de onde quiser.',
  },
  {
    q: 'Quantos barbeiros posso cadastrar?',
    a: 'Depende do plano. Temos opções para barbearias de 1 a 10+ profissionais. Cada barbeiro tem seu painel individual com agenda, comissões e desempenho separados.',
  },
]

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-white/[0.05]">
      {faqs.map((faq, i) => (
        <div key={i} className="py-6">
          <button
            className="w-full flex items-start justify-between gap-6 text-left group"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-syne text-[13px] md:text-[14px] font-medium uppercase tracking-[0.06em] text-white/60 group-hover:text-white/90 transition-colors duration-300 leading-snug">
              {faq.q}
            </span>
            <div className="text-white/20 group-hover:text-accent-main transition-colors duration-300 shrink-0 mt-[3px]">
              {open === i ? <Minus size={13} /> : <Plus size={13} />}
            </div>
          </button>
          {open === i && (
            <p className="mt-4 font-mono text-[11px] text-white/35 leading-[2.1] max-w-2xl">
              {faq.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
