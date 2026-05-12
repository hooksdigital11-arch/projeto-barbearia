'use client'

import { useState, useEffect, useTransition } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { addComandaItem } from '../actions'
import { createClient } from '@/lib/supabase/client'

export function AddServiceModal({ isOpen, onClose, clientId, appointmentId, onAdded }: any) {
  const [services, setServices] = useState<any[]>([])
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      supabase.from('services').select('*').eq('is_active', true).then(({ data }) => {
        if (data) setServices(data)
      })
    }
  }, [isOpen])

  const handleAdd = (service: any) => {
    startTransition(async () => {
      const formData = new FormData()
      formData.append('client_id', clientId)
      if (appointmentId) formData.append('appointment_id', appointmentId)
      formData.append('item_type', 'service')
      formData.append('name', service.name)
      formData.append('quantity', '1')
      formData.append('unit_price_cents', service.price_cents.toString())

      const res = await addComandaItem(formData)
      if (res.success) {
        toast.success('Serviço adicionado')
        onAdded()
        onClose()
      } else {
        toast.error(res.error || 'Erro')
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-bg-surface border-white/10 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-syne uppercase tracking-tight text-text-primary">Adicionar Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
          {services.map(service => (
            <div 
              key={service.id} 
              className="flex justify-between items-center p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
              onClick={() => handleAdd(service)}
            >
              <div>
                <p className="font-bold text-text-primary uppercase text-sm tracking-wide">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.duration_minutes} min</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-accent">R$ {(service.price_cents / 100).toFixed(2)}</span>
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="h-8 opacity-0 group-hover:opacity-100 transition-opacity" 
                  disabled={isPending}
                >
                  ADICIONAR
                </Button>
              </div>
            </div>
          ))}
          {services.length === 0 && <p className="text-center text-muted-foreground py-12">Nenhum serviço disponível.</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
