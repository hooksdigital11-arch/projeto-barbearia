'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, Envelope, ShareNetwork, FloppyDisk, CircleNotch, Clock } from '@phosphor-icons/react'
import { notificationPreferencesSchema, type NotificationPreferencesInput } from '../schemas'
import { updateNotifications } from '../actions'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
    { id: 'emailNewOrder', label: 'Nova comanda', desc: 'Receba um aviso quando uma comanda for finalizada' },
    { id: 'emailClientArrived', label: 'Cliente chegando', desc: 'Aviso quando o cliente entra na barbearia' },
    { id: 'emailNewAppointment', label: 'Novo agendamento', desc: 'Notificação instantânea de novas reservas' },
    { id: 'emailCancellation', label: 'Cancelamentos', desc: 'Fique sabendo de horários liberados' },
  ] as const

  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter">Notificações</h2>
        <p className="label-muted mt-2">Controle como você e seus clientes são avisados</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Email Section */}
          <div className="space-y-6">
            <h3 className="label-muted text-accent-cyan">Canais Digitais</h3>
            
            <div className="grid gap-4">
              {emailItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] transition-all">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{item.label}</p>
                    <p className="text-[11px] font-medium text-text-muted">{item.desc}</p>
                  </div>
                  <FormField
                    control={form.control}
                    name={item.id}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white uppercase tracking-tight">Relatório Diário</p>
                <p className="text-[11px] font-medium text-text-muted">Resumo do faturamento e agendamentos do dia anterior</p>
              </div>
              <div className="flex items-center gap-6">
                <FormField
                  control={form.control}
                  name="dailyReportTime"
                  render={({ field }) => (
                    <input 
                      {...field} 
                      type="time" 
                      className="bg-black border border-white/[0.06] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan/30 font-mono transition-all"
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailDailyReport"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="w-5 h-5 border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Section */}
          <div className="space-y-6">
            <h3 className="label-muted text-emerald-500">Automações Diretas</h3>
            
            <div className="p-10 rounded-[2.5rem] bg-emerald-500/[0.03] border border-emerald-500/10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">Confirmação Automática</p>
                  <p className="text-[11px] font-medium text-emerald-500/60 uppercase tracking-widest font-black">WhatsApp instantâneo</p>
                </div>
                <FormField
                  control={form.control}
                  name="whatsappConfirmations"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="w-5 h-5 border-emerald-500/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white uppercase tracking-tight">Lembrete 24h</p>
                  <p className="text-[11px] font-medium text-emerald-500/60 uppercase tracking-widest font-black">Redução de No-Show</p>
                </div>
                <FormField
                  control={form.control}
                  name="whatsappReminders"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="w-5 h-5 border-emerald-500/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-12 border-t border-white/[0.06]">
            <button 
              type="submit"
              disabled={isPending} 
              className="px-10 py-3.5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar Preferências'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
