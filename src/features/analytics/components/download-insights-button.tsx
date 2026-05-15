'use client'

import { useState } from 'react'
import { Download, CircleNotch } from '@phosphor-icons/react'
import { fetchInsightsData } from '../actions'
import { downloadInsightsPDF } from '@/lib/insights-pdf'

export function DownloadInsightsButton() {
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownloadPDF() {
    try {
      setIsDownloading(true)
      
      const rawData = await fetchInsightsData()
      
      // Mapping the data to the format expected by insights-pdf.js
      const data = {
        barbearia: rawData.barbearia,
        periodo: `Relatório de Insights — ${rawData.dataGeracao}`,
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
          ] // Placeholder for now as the server action doesn't return day breakdown yet
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
            faturamento: 0, // Placeholder
            observacao: 'Cliente retido'
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
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownloadPDF}
      disabled={isDownloading}
      className="flex items-center gap-2 bg-accent-cyan text-black px-4 py-2 rounded-xl font-bold hover:bg-accent-cyan/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDownloading ? (
        <CircleNotch size={20} className="animate-spin" />
      ) : (
        <Download size={20} weight="bold" />
      )}
      <span>{isDownloading ? 'Gerando PDF...' : 'Baixar Relatório'}</span>
    </button>
  )
}
