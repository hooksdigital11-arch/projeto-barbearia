'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FloppyDisk, CircleNotch } from '@phosphor-icons/react'
import { businessHoursSchema, type BusinessHoursInput } from '../schemas'
import { updateBusinessHours } from '../actions'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    <div className="space-y-10 max-w-4xl">
      <div className="space-y-0.5">
        <h2 className="text-[16px] font-medium text-text-primary uppercase tracking-[0.02em]">Horários</h2>
        <p className="text-[9px] font-medium uppercase tracking-[0.1em] text-text-muted/65">Defina as janelas de operação para agendamentos</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0">
          <div className="flex flex-col">
            {days.map((day, idx) => {
              const isOpen = form.watch(`${day.id}.isOpen`)
              
              return (
                <div 
                  key={day.id} 
                  className={cn(
                    "flex flex-col sm:grid sm:grid-cols-[24px_130px_1fr_auto_1fr_90px] gap-3 sm:items-center py-4 sm:py-[13px] transition-all",
                    !isOpen && "opacity-40"
                  )}
                  style={{ borderBottom: idx !== days.length - 1 ? '0.5px solid #141414' : 'none' }}
                >
                  <div className="flex items-center justify-between sm:contents">
                    <div className="flex items-center gap-3">
                      {/* Checkbox */}
                      <FormField
                        control={form.control}
                        name={`${day.id}.isOpen`}
                        render={({ field }) => (
                          <FormItem className="space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="w-4 h-4 border-[0.5px] border-border-main rounded-[4px] bg-bg-surface data-[state=checked]:bg-accent-main data-[state=checked]:border-accent-main transition-all"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      {/* Day Name */}
                      <span className={cn(
                        "text-[11px] font-medium uppercase tracking-wide transition-colors",
                        isOpen ? "text-text-secondary" : "text-text-muted"
                      )}>
                        {day.label}
                      </span>
                    </div>

                    {/* Badge */}
                    <div className="flex justify-end sm:contents">
                      <span className={cn(
                        "px-[10px] py-[4px] rounded-[5px] text-[9px] font-medium uppercase tracking-[0.08em] border-[0.5px] w-fit sm:col-start-6",
                        isOpen 
                          ? "bg-[#0d2e1a] text-[#00c070] border-[#00c07033]" 
                          : "bg-[#2e1a1a] text-[#c04040] border-[#c0404033]"
                      )}>
                        {isOpen ? 'ABERTO' : 'FECHADO'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:contents">
                    {/* Open Time */}
                    <FormField
                      control={form.control}
                      name={`${day.id}.open`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          type="time" 
                          disabled={!isOpen}
                          className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[8px_12px] text-[11px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all disabled:opacity-20 flex-1 sm:flex-initial sm:col-start-3"
                        />
                      )}
                    />

                    {/* ATÉ */}
                    <span className="text-[9px] text-text-muted/50 uppercase tracking-[0.08em] font-medium w-8 text-center shrink-0 sm:col-start-4">ATÉ</span>

                    {/* Close Time */}
                    <FormField
                      control={form.control}
                      name={`${day.id}.close`}
                      render={({ field }) => (
                        <input 
                          {...field} 
                          type="time" 
                          disabled={!isOpen}
                          className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[8px_12px] text-[11px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all disabled:opacity-20 flex-1 sm:flex-initial sm:col-start-5"
                        />
                      )}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-6 mt-4 border-t-[0.5px] border-border-main/50 flex justify-end">
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
              Salvar Horários
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
