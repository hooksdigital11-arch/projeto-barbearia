'use client'

import { CloudArrowDown, FileCsv, Users, Calendar, Receipt, Database, ArrowRight, WarningCircle, CircleNotch } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'
import { useState } from 'react'
import { fetchInsightsData } from '@/features/analytics/actions'
import { downloadInsightsPDF } from '@/lib/insights-pdf'

export function BackupSettings() {
  const [isExporting, setIsExporting] = useState<string | null>(null)

  const handleExport = async (type: string) => {
    if (type === 'Todos os Dados') {
      try {
        setIsExporting(type)
        toast.loading(`Gerando arquivo ${type.toUpperCase()}...`, { id: 'export-toast' })
        
        const rawData = await fetchInsightsData()
        
        const data = {
          barbearia: rawData.barbearia,
          periodo: `Backup Geral — \${rawData.dataGeracao}`,
          dataGeracao: rawData.dataGeracao,
          receita: {
            faturamentoTotal: rawData.receita.faturamentoTotal,
            variacaoSemana: rawData.receita.variacaoSemana,
            ticketMedio: rawData.receita.ticketMedio,
            totalAtendimentos: rawData.receita.totalAtendimentos,
            pagamentosPendentes: rawData.receita.pagamentosPendentes,
            valorPresente: (rawData.receita as any).valorPresente || 0,
            topServicos: rawData.receita.topServicos.map(s => ({
              nome: s.nome,
              categoria: s.categoria,
              faturamento: s.faturamento,
              participacao: s.participacao || 'Mix',
              destaque: s.destaque
            }))
          },
          agenda: {
            total: rawData.agenda.total,
            confirmados: rawData.agenda.confirmados,
            cancelados: rawData.agenda.cancelados,
            noShow: rawData.agenda.noShow,
            taxaConclusao: rawData.agenda.taxaConclusao,
            porDia: [
              { dia: 'Segunda-feira', agendamentos: 0, concluidos: 0 },
              { dia: 'Terça-feira', agendamentos: 0, concluidos: 0 },
              { dia: 'Quarta-feira', agendamentos: 0, concluidos: 0 },
              { dia: 'Quinta-feira', agendamentos: 0, concluidos: 0 },
              { dia: 'Sexta-feira', agendamentos: 0, concluidos: 0 },
              { dia: 'Sábado', agendamentos: 0, concluidos: 0 },
              { dia: 'Domingo', agendamentos: 0, concluidos: 0 },
            ]
          },
          clientes: {
            total: rawData.clientes.total,
            ativos: rawData.clientes.ativos,
            novos: rawData.clientes.novos,
            taxaRetencao: rawData.clientes.taxaRetencao,
            satisfacao: rawData.clientes.satisfacao,
            lista: rawData.clientes.lista.map(c => ({
              nome: c.nome,
              status: 'ATIVO',
              faturamento: 0,
              observacao: 'Backup realizado'
            }))
          },
          equipe: rawData.equipe.map(e => ({
            nome: e.nome,
            avaliacao: e.avaliacao,
            agendamentos: e.agendamentos,
            faturamento: e.faturamento,
            status: e.status
          })),
          fidelidade: {
            inscritos: rawData.fidelidade.inscritos,
            pontosResgatados: rawData.fidelidade.resgatesMes,
            presentesMes: 0,
            progressaoMedia: rawData.fidelidade.progressaoMedia,
            clientesBonificados: rawData.fidelidade.engajamento
          }
        }

        await downloadInsightsPDF(data)
        toast.success(`Exportação de \${type} concluída!`, { id: 'export-toast' })
      } catch (error) {
        console.error('Erro ao exportar PDF:', error)
        toast.error('Erro ao exportar dados.', { id: 'export-toast' })
      } finally {
        setIsExporting(null)
      }
    } else {
      toast.promise(
        new Promise((resolve) => setTimeout(resolve, 1500)),
        {
          loading: `Gerando arquivo ${type.toUpperCase()}...`,
          success: `Exportação de ${type} iniciada!`,
          error: 'Erro ao exportar dados.',
        }
      )
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-0.5">
        <h2 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Backup</h2>
        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#2a2a2a]">Mantenha seus dados seguros e exporte quando precisar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        
        {/* Card Exportar */}
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[18px] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] rounded-[9px] bg-[#0d1e2e] flex items-center justify-center text-[#4285f4]">
              <CloudArrowDown size={18} weight="bold" />
            </div>
            <h3 className="text-[14px] font-medium text-text-primary uppercase tracking-[0.06em]">Exportar</h3>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {[
              { label: 'Todos os Dados', icon: FileCsv },
              { label: 'Clientes', icon: Users },
              { label: 'Agendamentos', icon: Calendar },
              { label: 'Financeiro', icon: Receipt },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleExport(item.label)}
                disabled={isExporting !== null}
                className="flex items-center justify-between p-[12px_14px] bg-bg-surface border-[0.5px] border-border-main rounded-[8px] hover:bg-bg-surface hover:border-[#222] transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={14} className="text-[#2e2e2e] group-hover:text-text-secondary transition-colors" />
                  <span className="text-[11px] text-text-muted group-hover:text-text-secondary uppercase tracking-[0.04em] transition-colors">{item.label}</span>
                </div>
                {isExporting === item.label ? (
                  <CircleNotch size={14} className="text-[#2a2a2a] animate-spin" />
                ) : (
                  <ArrowRight size={14} className="text-[#2a2a2a] group-hover:text-accent-main transition-all group-hover:translate-x-0.5" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card Status */}
        <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[10px] p-[18px] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-[40px] h-[40px] rounded-[9px] bg-[#0d2e29] flex items-center justify-center text-accent-main">
              <Database size={18} weight="bold" />
            </div>
            <h3 className="text-[14px] font-medium text-text-primary uppercase tracking-[0.06em]">Status</h3>
          </div>

          <div className="space-y-3">
            <div className="bg-[#0a1a14] border-[0.5px] border-[var(--accent-10, #00d4aa1a)] rounded-[8px] p-4 flex flex-col gap-1">
              <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#2a3a2e]">Último Backup Automático</span>
              <div className="flex items-center justify-between">
                <span className="text-[20px] font-medium text-text-primary tracking-tight">HOJE ÀS <span className="text-accent-main">03:00</span></span>
                <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md">
                  <div className="w-[7px] h-[7px] rounded-full bg-accent-main" />
                  <span className="text-[10px] text-accent-main uppercase tracking-[0.06em]">OK</span>
                </div>
              </div>
              <span className="text-[9px] text-[#2a2a2a] uppercase tracking-wider ml-auto mt-1">Supabase Cloud</span>
            </div>

            <div className="bg-bg-surface border-[0.5px] border-border-main rounded-[8px] p-[12px_14px]">
              <p className="text-[10px] text-[#2e2e2e] leading-[1.6]">
                Sua base de dados é sincronizada diariamente às <span className="font-medium text-[#383838]">03:00 da manhã</span> para garantir a integridade total das informações.
              </p>
            </div>

            <div className="bg-[#1a1200] border-l-2 border-[#d4aa00] rounded-[8px] p-[12px_14px] space-y-1">
              <div className="flex items-center gap-1.5">
                <WarningCircle size={12} className="text-[#d4aa00]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#d4aa00]">Nota</span>
              </div>
              <p className="text-[10px] text-[#6a5a20] leading-[1.6]">
                Em caso de necessidade de restauração de dados críticos, entre em contato com o suporte técnico para assistência imediata.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
