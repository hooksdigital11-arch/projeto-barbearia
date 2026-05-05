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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-syne text-white">Horários de Funcionamento</h2>
        <p className="text-muted-foreground">Defina quando sua barbearia está aberta para agendamentos</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {days.map((day) => (
              <div 
                key={day.id} 
                className={cn(
                  "flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border transition-all",
                  form.watch(`${day.id}.isOpen`) 
                    ? "bg-white/5 border-white/10" 
                    : "bg-black/20 border-white/5 opacity-60"
                )}
              >
                <div className="flex items-center gap-4 min-w-[160px]">
                  <FormField
                    control={form.control}
                    name={`${day.id}.isOpen`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-white/20 data-[state=checked]:bg-accent-cyan data-[state=checked]:border-accent-cyan"
                          />
                        </FormControl>
                        <FormLabel className="ml-3 text-sm font-bold text-white cursor-pointer uppercase tracking-tight">
                          {day.label}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className={cn(
                  "flex items-center gap-3 mt-4 md:mt-0 transition-all",
                  !form.watch(`${day.id}.isOpen`) && "pointer-events-none opacity-20"
                )}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Início</span>
                    <FormField
                      control={form.control}
                      name={`${day.id}.open`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          type="time" 
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent-cyan outline-none"
                        />
                      )}
                    />
                  </div>
                  
                  <div className="w-4 h-[1px] bg-white/20" />

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Fim</span>
                    <FormField
                      control={form.control}
                      name={`${day.id}.close`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          type="time" 
                          className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-accent-cyan outline-none"
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="hidden md:block">
                  {!form.watch(`${day.id}.isOpen`) ? (
                    <span className="text-xs font-bold text-red-400/50 uppercase tracking-widest">Fechado</span>
                  ) : (
                    <span className="text-xs font-bold text-accent-cyan/50 uppercase tracking-widest">Aberto</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-8">
            <Button disabled={isPending} className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 px-8 py-6 rounded-2xl text-base shadow-lg shadow-cyan-500/20">
              {isPending ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
              Salvar Horários
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
