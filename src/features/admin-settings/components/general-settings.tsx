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
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold font-syne text-white">Dados da Barbearia</h2>
        <p className="text-muted-foreground">Informações públicas e de contato da sua unidade</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* Logo Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-3xl bg-white/5 border border-white/5">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[2rem] bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-accent-cyan/50">
                {form.watch('logoUrl') ? (
                  <Image src={form.watch('logoUrl')!} alt="Logo" fill className="object-cover" />
                ) : (
                  <Storefront size={40} weight="duotone" className="text-muted-foreground" />
                )}
                {isUploading ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <CircleNotch size={24} className="animate-spin text-accent-cyan" />
                  </div>
                ) : null}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-accent-cyan text-black rounded-2xl shadow-xl hover:scale-105 transition-all">
                <UploadSimple size={20} weight="bold" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-lg font-bold text-white">Logo da Marca</h3>
              <p className="text-xs text-muted-foreground max-w-[280px]">Quadrada, máx. 5MB, 1080x1080px.</p>
              {form.watch('logoUrl') ? (
                <button type="button" onClick={() => form.setValue('logoUrl', '')} className="text-[10px] text-red-400 uppercase font-bold tracking-widest hover:underline flex items-center gap-1 mt-2 justify-center md:justify-start">
                  <Trash size={12} /> Remover Logo
                </button>
              ) : null}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Nome da Barbearia</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} value={field.value ?? ''} className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan" />
                      <Storefront size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Email de Contato</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} value={field.value ?? ''} type="email" className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan" />
                      <Envelope size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Telefone</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input {...field} value={field.value ?? ''} className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan" />
                      <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">CEP</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} className="bg-black/20 border-white/10 focus:border-accent-cyan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Endereço (Rua/Av)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input {...field} value={field.value ?? ''} className="pl-10 bg-black/20 border-white/10 focus:border-accent-cyan" />
                        <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Nº</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} className="bg-black/20 border-white/10 focus:border-accent-cyan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Bairro</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} className="bg-black/20 border-white/10 focus:border-accent-cyan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Cidade</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} className="bg-black/20 border-white/10 focus:border-accent-cyan" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">UF</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ''} maxLength={2} className="bg-black/20 border-white/10 focus:border-accent-cyan uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Descrição / Bio</FormLabel>
                <FormControl>
                  <div className="relative">
                    <textarea 
                      {...field} 
                      value={field.value ?? ''}
                      rows={3}
                      className="w-full pl-10 p-3 bg-black/20 border border-white/10 rounded-xl focus:border-accent-cyan outline-none text-sm transition-all"
                    />
                    <TextT size={18} className="absolute left-3 top-4 text-muted-foreground" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button disabled={isPending} className="bg-accent-cyan hover:bg-cyan-400 text-black font-bold gap-2 px-8 py-6 rounded-2xl text-base shadow-lg shadow-cyan-500/20">
              {isPending ? <CircleNotch size={20} className="animate-spin" /> : <FloppyDisk size={20} />}
              Salvar Configurações
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
