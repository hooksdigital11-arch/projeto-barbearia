'use client'

import { CloudArrowDown, FileJson, FileCsv, Database, Clock, ArrowRight } from '@phosphor-icons/react'
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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-syne text-white">Backup e Exportação</h2>
        <p className="text-muted-foreground">Mantenha seus dados seguros e exporte quando precisar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 rounded-[2rem] bg-accent-blue/5 border border-accent-blue/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent-blue/20 flex items-center justify-center text-accent-blue shadow-lg shadow-accent-blue/20">
              <CloudArrowDown size={28} weight="duotone" />
            </div>
            <h3 className="text-lg font-bold text-white">Exportar Dados</h3>
          </div>
          
          <div className="grid gap-3">
            {[
              { label: 'Todos os Dados', type: 'JSON', icon: FileJson },
              { label: 'Lista de Clientes', type: 'CSV', icon: FileCsv },
              { label: 'Histórico de Agendamentos', type: 'CSV', icon: FileCsv },
              { label: 'Relatório Financeiro', type: 'JSON', icon: FileJson },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => handleExport(item.label)}
                className="flex items-center justify-between p-4 rounded-xl bg-black/40 hover:bg-black/60 border border-white/5 hover:border-accent-blue/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <item.icon size={20} className="text-muted-foreground group-hover:text-accent-blue transition-colors" />
                  <span className="text-sm font-medium text-white">{item.label}</span>
                </div>
                <ArrowRight size={16} className="text-muted-foreground group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-[2rem] bg-white/5 border border-white/5 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-muted-foreground">
              <Database size={28} weight="duotone" />
            </div>
            <h3 className="text-lg font-bold text-white">Estado do Backup</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-accent-cyan" />
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Último Backup Automático</span>
              </div>
              <span className="text-xs font-bold text-white">Hoje às 03:00</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Sua base de dados é backupeada automaticamente todos os dias às 03:00 da manhã no cluster do Supabase. 
            </p>

            <div className="p-4 rounded-xl bg-accent-cyan/5 border border-accent-cyan/10">
              <p className="text-xs text-accent-cyan leading-relaxed">
                <strong>Nota:</strong> Em caso de necessidade de restauração de dados críticos, entre em contato com o suporte técnico do BarberSaaS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
