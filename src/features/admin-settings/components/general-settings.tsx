'use client'

import { useTransition, useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FloppyDisk, CircleNotch, UploadSimple, Trash, Storefront } from '@phosphor-icons/react'
import { generalSettingsSchema, type GeneralSettingsInput } from '../schemas'
import { updateGeneralSettings, uploadLogo } from '../actions'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'

export function GeneralSettings({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const form = useForm<GeneralSettingsInput>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      phone: initialData?.phone ?? '',
      address: initialData?.address ?? '',
      number: initialData?.address_number ?? '',
      neighborhood: initialData?.neighborhood ?? '',
      city: initialData?.city ?? '',
      state: initialData?.state ?? '',
      zipCode: initialData?.zip_code ?? '',
      description: initialData?.description ?? '',
      logoUrl: initialData?.logo_url ?? '',
    },
  })

  // Sincronizar dados se mudarem no servidor
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? '',
        email: initialData.email ?? '',
        phone: initialData.phone ?? '',
        address: initialData.address ?? '',
        number: initialData.address_number ?? '',
        neighborhood: initialData.neighborhood ?? '',
        city: initialData.city ?? '',
        state: initialData.state ?? '',
        zipCode: initialData.zip_code ?? '',
        description: initialData.description ?? '',
        logoUrl: initialData.logo_url ?? '',
      })
    }
  }, [initialData, form])

  async function onSubmit(data: GeneralSettingsInput) {
    startTransition(async () => {
      try {
        const result = await updateGeneralSettings(data)
        if (result.success) {
          toast.success('Configurações salvas!')
          router.refresh()
        } else {
          toast.error(result.error)
        }
      } catch (err) {
        toast.error('Erro ao salvar configurações.')
      }
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const result = await uploadLogo(formData)
      if (result.url) {
        form.setValue('logoUrl', result.url)
        toast.success('Logo carregada!')
        router.refresh()
      } else if (result.error) {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Erro no upload da logo.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-10 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Logo Block */}
          <div className="bg-bg-sidebar border-[0.5px] border-border-main rounded-[9px] p-4 flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-[80px] h-[80px] rounded-[8px] bg-[#1a1a1a] border-[0.5px] border-[#222] flex items-center justify-center overflow-hidden">
                {form.watch('logoUrl') ? (
                  <Image src={form.watch('logoUrl')!} alt="Logo" width={80} height={80} className="object-cover" />
                ) : (
                  <Storefront size={32} className="text-[#333]" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                    <CircleNotch size={20} className="animate-spin text-accent-main" />
                  </div>
                )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 w-[22px] h-[22px] bg-bg-sidebar border-[0.5px] border-[#2a2a2a] rounded-[5px] flex items-center justify-center hover:border-[#444] transition-all"
              >
                <UploadSimple size={11} weight="bold" className="text-text-nav" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>

            <div className="flex-1 space-y-1">
              <h3 className="text-[13px] font-medium text-text-secondary">Logo da Marca</h3>
              <p className="text-[10px] text-[#2e2e2e] leading-[1.5]">
                Esta imagem será exibida nos agendamentos, mensagens e faturas. Recomendamos o uso de uma versão quadrada da sua logo.
              </p>
              {form.watch('logoUrl') && (
                <button 
                  type="button" 
                  onClick={() => form.setValue('logoUrl', '')}
                  className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#c04040] hover:text-red-400 mt-2 transition-colors"
                >
                  <Trash size={12} /> REMOVER LOGO
                </button>
              )}
            </div>
          </div>

          {/* Form Grid */}
          <div className="space-y-6">
            {/* Row 1: Name + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Nome da Barbearia</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Email de Contato</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        type="email"
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 2: Phone + CEP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[10px]">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Telefone</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">CEP</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 3: Address + Number */}
            <div className="grid grid-cols-[2fr_0.5fr] gap-[10px]">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Endereço (Rua/Av)</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="number"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Nº</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Row 4: Neighborhood + City + UF */}
            <div className="grid grid-cols-[1.5fr_1.5fr_0.6fr] gap-[10px]">
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Bairro</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Cidade</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">UF</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        maxLength={2}
                        className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all uppercase"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            {/* Description / Bio */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#383838]">Descrição / Bio</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field} 
                      className="w-full bg-bg-sidebar border-[0.5px] border-border-main rounded-[7px] p-[10px_13px] text-[12px] text-text-secondary focus:outline-none focus:border-accent-main/20 transition-all h-[72px] resize-none leading-[1.6]"
                    />
                  </FormControl>
                  <FormMessage className="text-[9px] text-red-500" />
                </FormItem>
              )}
            />
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
