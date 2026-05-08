'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Clock, FloppyDisk, CircleNotch } from '@phosphor-icons/react'
import { businessHoursSchema, type BusinessHoursInput } from '../schemas'
import { updateBusinessHours } from '../actions'
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

const days = [
  { id: 'monday', label: 'Segunda-feira' },
  { id: 'tuesday', label: 'Terça-feira' },
  { id: 'wednesday', label: 'Quarta-feira' },
  { id: 'thursday', label: 'Quinta-feira' },
  { id: 'friday', label: 'Sexta-feira' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
] as const

export function BusinessHours({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition()
  
  const form = useForm<BusinessHoursInput>({
    resolver: zodResolver(businessHoursSchema),
    defaultValues: initialData || {
      monday: { isOpen: true, open: '09:00', close: '18:00' },
      tuesday: { isOpen: true, open: '09:00', close: '18:00' },
      wednesday: { isOpen: true, open: '09:00', close: '18:00' },
      thursday: { isOpen: true, open: '09:00', close: '18:00' },
      friday: { isOpen: true, open: '09:00', close: '18:00' },
      saturday: { isOpen: true, open: '09:00', close: '13:00' },
      sunday: { isOpen: false, open: '09:00', close: '12:00' },
    },
  })

  function onSubmit(data: BusinessHoursInput) {
    startTransition(async () => {
      const result = await updateBusinessHours(data)
      if (result.success) {
        toast.success('Horários atualizados!')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <div className="space-y-16">
      <div>
        <h2 className="text-3xl font-black font-syne text-white uppercase tracking-tighter">Horários</h2>
        <p className="label-muted mt-2">Defina as janelas de operação para agendamentos</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {days.map((day) => (
              <div 
                key={day.id} 
                className={cn(
                  "flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2rem] border transition-all",
                  form.watch(`${day.id}.isOpen`) 
                    ? "bg-white/[0.03] border-white/[0.06]" 
                    : "bg-black/20 border-white/5 opacity-40"
                )}
              >
                <div className="flex items-center gap-6 min-w-[200px]">
                  <FormField
                    control={form.control}
                    name={`${day.id}.isOpen`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="w-5 h-5 border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                          />
                        </FormControl>
                        <FormLabel className="ml-4 text-sm font-bold text-white cursor-pointer uppercase tracking-tight">
                          {day.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className={cn(
                  "flex items-center gap-6 mt-4 md:mt-0 transition-all",
                  !form.watch(`${day.id}.isOpen`) && "pointer-events-none opacity-20"
                )}>
                  <div className="flex items-center gap-3">
                    <span className="label-muted">Início</span>
                    <FormField
                      control={form.control}
                      name={`${day.id}.open`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          type="time" 
                          className="bg-black border border-white/[0.06] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan/30 font-mono transition-all"
                        />
                      )}
                    />
                  </div>
                  
                  <div className="w-6 h-[1px] bg-white/10" />

                  <div className="flex items-center gap-3">
                    <span className="label-muted">Fim</span>
                    <FormField
                      control={form.control}
                      name={`${day.id}.close`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          type="time" 
                          className="bg-black border border-white/[0.06] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-accent-cyan/30 font-mono transition-all"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="hidden md:block">
                  {!form.watch(`${day.id}.isOpen`) ? (
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest opacity-40">Fechado</span>
                  ) : (
                    <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest">Aberto</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-12 border-t border-white/[0.06]">
            <button 
              type="submit"
              disabled={isPending} 
              className="px-10 py-3.5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isPending ? 'Salvando...' : 'Salvar Horários'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
