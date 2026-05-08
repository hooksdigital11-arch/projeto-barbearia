'use client'

import { useTransition, useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Storefront, Envelope, Phone, MapPin, FloppyDisk, CircleNotch, UploadSimple, Trash, TextT } from '@phosphor-icons/react'
import { generalSettingsSchema, type GeneralSettingsInput } from '../schemas'
import { updateGeneralSettings, uploadLogo } from '../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    if (initialData && !form.getValues('name')) {
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
    try {
      const result = await updateGeneralSettings(data)
      if (result.success) {
        toast.success('Configurações salvas!')
        router.refresh()
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error('Erro de conexão com o servidor.')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }

    const img = new window.Image()
    img.src = URL.createObjectURL(file)
    
    await new Promise((resolve) => {
      img.onload = () => {
        if (img.width !== img.height) {
          toast.error('A logo deve ser quadrada (1:1)')
          resolve(false)
        } else if (img.width > 1080 || img.height > 1080) {
          toast.error('Resolução máxima permitida: 1080x1080')
          resolve(false)
        } else {
          resolve(true)
        }
      }
    }).then(async (isValid) => {
      if (!isValid) return

      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)

        const result = await uploadLogo(formData)

        if (result.error) {
          throw new Error(result.error)
        }

        if (result.url) {
          form.setValue('logoUrl', result.url)
          toast.success('Logo carregada!')
          router.refresh()
        }
      } catch (error: any) {
        console.error('Upload error:', error)
        toast.error('Erro no upload: ' + (error.message || 'Falha na conexão'))
      } finally {
        setIsUploading(false)
      }
    })
  }

  return (
    <div className="space-y-16">
      <div className="border-l-2 border-accent-cyan pl-8 py-2">
        <h2 className="text-4xl md:text-5xl font-black font-syne text-white uppercase tracking-tighter leading-none">Dados da Unidade</h2>
        <p className="label-muted mt-2">Identidade visual & Informações públicas</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
          {/* Logo Section: Precise & Layered */}
          <div className="flex flex-col lg:flex-row items-center gap-12 p-12 rounded-[2rem] bg-white/[0.02] border border-white/[0.06]">
            <div className="relative group shrink-0">
              <div className="w-48 h-48 rounded-[3rem] bg-black border border-white/[0.1] flex items-center justify-center overflow-hidden transition-all group-hover:border-accent-cyan/40">
                {form.watch('logoUrl') ? (
                  <Image src={form.watch('logoUrl')!} alt="Logo" fill className="object-cover" />
                ) : (
                  <Storefront size={56} className="text-white/5" />
                )}
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                    <CircleNotch size={32} className="animate-spin text-accent-cyan" />
                  </div>
                ) : null}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="absolute -bottom-2 -right-2 w-14 h-14 flex items-center justify-center bg-accent-cyan text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
              >
                <UploadSimple size={24} weight="bold" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            <div className="space-y-4 text-center lg:text-left">
              <h3 className="text-2xl font-bold text-white tracking-tight leading-none font-syne">Logo da Marca</h3>
              <p className="text-sm text-text-muted max-w-[320px] font-medium leading-relaxed">
                Esta imagem será exibida nos agendamentos, mensagens e faturas. Recomendamos o uso de uma versão quadrada da sua logo.
              </p>
              {form.watch('logoUrl') ? (
                <button 
                  type="button" 
                  onClick={() => form.setValue('logoUrl', '')} 
                  className="text-[10px] text-red-400 font-black uppercase tracking-[0.2em] hover:text-red-300 transition-colors flex items-center gap-2 mt-6 justify-center lg:justify-start"
                >
                  <Trash size={16} /> Remover Logo
                </button>
              ) : null}
            </div>
          </div>

          {/* Form Fields: Grid & DM Mono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Nome da Barbearia</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-sans" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Email de Contato</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      type="email" 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Telefone</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">CEP</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
            <div className="lg:col-span-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Endereço (Rua/Av)</FormLabel>
                    <FormControl>
                      <input 
                        {...field} 
                        value={field.value ?? ''} 
                        className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all" 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Nº</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all font-mono" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Bairro</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Cidade</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">UF</FormLabel>
                  <FormControl>
                    <input 
                      {...field} 
                      value={field.value ?? ''} 
                      maxLength={2} 
                      className="w-full px-8 py-5 bg-black border border-white/[0.06] rounded-2xl text-base font-bold text-white focus:outline-none focus:border-accent-cyan/40 uppercase transition-all font-mono" 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted">Descrição / Bio</FormLabel>
                <FormControl>
                  <textarea 
                    {...field} 
                    value={field.value ?? ''}
                    rows={4}
                    placeholder="Conte um pouco sobre sua barbearia para seus clientes..."
                    className="w-full px-8 py-6 bg-black border border-white/[0.06] rounded-3xl text-base font-medium text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/40 transition-all resize-none leading-relaxed"
                  />
                </FormControl>
                <FormMessage className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-widest" />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-12 border-t border-white/[0.06]">
            <button 
              type="submit"
              disabled={isPending} 
              className="px-12 py-5 rounded-full bg-accent-cyan text-black font-black uppercase tracking-[0.3em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(0,229,255,0.2)]"
            >
              {isPending ? (
                <div className="flex items-center gap-3">
                  <CircleNotch size={16} className="animate-spin" />
                  Salvando...
                </div>
              ) : 'Confirmar Alterações'}
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
