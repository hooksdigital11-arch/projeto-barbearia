'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FloppyDisk, CircleNotch, Clock } from '@phosphor-icons/react'
import { notificationPreferencesSchema, type NotificationPreferencesInput } from '../schemas'
import { updateNotifications } from '../actions'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { cn } from '@/lib/utils/cn'

export function NotificationsSettings({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<NotificationPreferencesInput>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: initialData || {
      emailNewOrder: true,
      emailClientArrived: true,
      emailNewAppointment: true,
      emailCancellation: true,
      emailDailyReport: true,
      dailyReportTime: '08:00',
      whatsappConfirmations: false,
      whatsappReminders: false,
    },
  })

  function onSubmit(data: NotificationPreferencesInput) {
    startTransition(async () => {
      const result = await updateNotifications(data)
      if (result.success) {
        toast.success('Preferências salvas!')
      } else {
        toast.error(result.error)
      }
    })
  }

  const emailItems = [
    { id: 'emailNewOrder', label: 'Nova comanda', desc: 'Receba um aviso quando uma comanda for finalizada', tag: 'EMAIL' },
    { id: 'emailClientArrived', label: 'Cliente chegando', desc: 'Aviso quando o cliente entra na barbearia', tag: 'DASHBOARD' },
    { id: 'emailNewAppointment', label: 'Novo agendamento', desc: 'Notificação instantânea de novas reservas', tag: 'EMAIL' },
    { id: 'emailCancellation', label: 'Cancelamentos', desc: 'Fique sabendo de horários liberados', tag: 'EMAIL' },
  ] as const

  // Custom Toggle UI (Still using field.value and field.onChange)
  const Toggle = ({ value, onChange }: { value: boolean, onChange: (v: boolean) => void }) => (
    <div 
      onClick={() => onChange(!value)}
      className={cn(
        "w-[36px] h-[20px] rounded-[10px] relative cursor-pointer transition-all duration-200 border-[0.5px]",
        value 
          ? "bg-accent-main border-accent-main" 
          : "bg-[#1e1e1e] border-[#2a2a2a]"
      )}
    >
      <div className={cn(
        "w-[14px] h-[14px] rounded-full absolute top-[2px] transition-all duration-200",
        value 
          ? "bg-black left-[18px]" 
          : "bg-[#444] left-[2px]"
      )} />
    </div>
  )

  return (
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-0.5">
        <h2 className="text-[15px] font-medium text-text-primary uppercase tracking-[0.02em]">Notificações</h2>
        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#2a2a2a] mb-[18px]">Controle como você e seus clientes são avisados</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          
          {/* Canais Digitais */}
          <div className="space-y-4">
            <h3 className="text-[9px] font-medium uppercase tracking-[0.12em] text-accent-main">Canais Digitais</h3>
            
            <div className="flex flex-col gap-1.5">
              {emailItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-[14px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[14px_16px]">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium text-text-secondary tracking-[0.04em] uppercase">{item.label}</span>
                    <span className="text-[10px] text-[#2e2e2e] leading-tight">{item.desc}</span>
                    <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-accent-main mt-0.5">{item.tag}</span>
                  </div>
                  <FormField
                    control={form.control}
                    name={item.id}
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Toggle value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {/* Relatório Diário Row */}
              <div className="flex items-center justify-between gap-[14px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[14px_16px]">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-text-secondary tracking-[0.04em] uppercase">Relatório Diário</span>
                  <span className="text-[10px] text-[#2e2e2e] leading-tight">Resumo do faturamento e agendamentos do dia anterior</span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[6px] p-[5px_10px] flex items-center gap-1.5">
                      <Clock size={12} className="text-[#333]" />
                      <FormField
                        control={form.control}
                        name="dailyReportTime"
                        render={({ field }) => (
                          <input 
                            {...field} 
                            type="time" 
                            className="bg-transparent border-none text-[11px] text-text-secondary focus:outline-none w-[60px]"
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="emailDailyReport"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Toggle value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="h-[0.5px] bg-[#161616]" />

          {/* Automações Diretas */}
          <div className="space-y-4">
            <h3 className="text-[9px] font-medium uppercase tracking-[0.12em] text-accent-main">Automações Diretas</h3>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-[14px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[14px_16px]">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-text-secondary tracking-[0.04em] uppercase">Confirmação Automática</span>
                  <span className="text-[10px] text-[#2e2e2e] leading-tight">Envio de mensagem instantânea via WhatsApp</span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-accent-main mt-0.5">WHATSAPP</span>
                </div>
                <FormField
                  control={form.control}
                  name="whatsappConfirmations"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Toggle value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between gap-[14px] bg-bg-sidebar border-[0.5px] border-border-main rounded-[8px] p-[14px_16px]">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-text-secondary tracking-[0.04em] uppercase">Lembrete 24h</span>
                  <span className="text-[10px] text-[#2e2e2e] leading-tight">Notificação enviada um dia antes do agendamento</span>
                  <span className="text-[9px] font-medium uppercase tracking-[0.08em] text-accent-main mt-0.5">REDUÇÃO DE NO-SHOW</span>
                </div>
                <FormField
                  control={form.control}
                  name="whatsappReminders"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Toggle value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t-[0.5px] border-border-main/50 flex justify-end">
            <button 
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-accent-main text-black px-[18px] py-[10px] rounded-[7px] text-[10px] font-medium uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_20px_color-mix(in_srgb,var(--accent)_10%,transparent)]"
            >
              {isPending ? (
                <CircleNotch size={14} className="animate-spin" />
              ) : (
                <FloppyDisk size={14} weight="bold" />
              )}
              Salvar Preferências
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
