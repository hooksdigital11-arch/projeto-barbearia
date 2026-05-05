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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-syne text-white">Notificações</h2>
        <p className="text-muted-foreground">Escolha como você quer ser avisado sobre o que acontece na sua barbearia</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Email Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent-cyan mb-4">
              <Envelope size={20} weight="duotone" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Notificações por Email</h3>
            </div>
            
            <div className="grid gap-4">
              {emailItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
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
                            className="border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Relatório Diário</p>
                <p className="text-xs text-muted-foreground">Resumo do faturamento e agendamentos do dia anterior</p>
              </div>
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="dailyReportTime"
                  render={({ field }) => (
                    <div className="relative group">
                      <input 
                        {...field} 
                        type="time" 
                        className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent-cyan outline-none"
                      />
                    </div>
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
                          className="border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* WhatsApp Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 mb-4">
              <ShareNetwork size={20} weight="duotone" />
              <h3 className="text-sm font-bold uppercase tracking-widest">Automações WhatsApp</h3>
            </div>
            
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Confirmação Automática</p>
                  <p className="text-xs text-muted-foreground">Enviar confirmação instantânea para o cliente</p>
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
                          className="border-emerald-500/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Lembrete 24h</p>
                  <p className="text-xs text-muted-foreground">Reduz o no-show enviando um lembrete automático</p>
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
                          className="border-emerald-500/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button disabled={isPending} className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 px-8 py-6 rounded-2xl text-base shadow-lg shadow-cyan-500/20">
              {isPending ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
              Salvar Preferências
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
