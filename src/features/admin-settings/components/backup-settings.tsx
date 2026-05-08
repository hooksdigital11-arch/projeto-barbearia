'use client'

import { CloudArrowDown, FileCode, FileText, Database, Clock, ArrowRight } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function BackupSettings() {
  const handleExport = (type: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Gerando arquivo ${type.toUpperCase()}...`,
        success: `Exportação de ${type} iniciada!`,
        error: 'Erro ao exportar dados.',
      }
    )
  }

  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter leading-none">Backup</h2>
        <p className="label-muted mt-2">Mantenha seus dados seguros e exporte quando precisar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.06] space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-black border border-white/[0.06] flex items-center justify-center text-white/20">
              <CloudArrowDown size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Exportar</h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Todos os Dados', type: 'JSON', icon: FileCode },
              { label: 'Lista de Clientes', type: 'CSV', icon: FileText },
              { label: 'Histórico de Agendamentos', type: 'CSV', icon: FileText },
              { label: 'Relatório Financeiro', type: 'JSON', icon: FileCode },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleExport(item.label)}
                className="w-full flex items-center justify-between p-6 rounded-2xl border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.02] transition-all group"
              >
                <div className="flex items-center gap-4">
                  <item.icon size={20} className="text-text-muted group-hover:text-accent-cyan transition-colors" />
                  <span className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</span>
                </div>
                <ArrowRight size={16} className="text-text-muted group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/[0.06] space-y-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-black border border-white/[0.06] flex items-center justify-center text-white/20">
              <Database size={32} />
            </div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Status</h3>
          </div>

          <div className="space-y-8">
            <div className="p-8 rounded-2xl bg-black border border-white/[0.06]">
              <p className="label-muted text-accent-cyan mb-2">Último Backup Automático</p>
              <p className="text-2xl font-black text-white font-mono tracking-tighter">HOJE ÀS 03:00</p>
            </div>

            <p className="text-sm font-medium text-text-muted leading-relaxed">
              Sua base de dados é backupeada automaticamente todos os dias às 03:00 da manhã no cluster do Supabase. 
            </p>

            <div className="p-6 rounded-2xl border border-white/[0.06] bg-accent-cyan/[0.02]">
              <p className="text-[11px] font-black uppercase tracking-widest text-accent-cyan leading-relaxed">
                Nota: Em caso de necessidade de restauração, entre em contato com o suporte técnico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
