import { z } from 'zod'

// 1. Configurações Gerais
export const generalSettingsSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  address: z.string().min(5, 'Endereço muito curto'),
  number: z.string().min(1, 'Obrigatório'),
  neighborhood: z.string().min(2, 'Obrigatório'),
  city: z.string().min(2, 'Obrigatório'),
  state: z.string().length(2, 'Use a sigla (ex: SP)'),
  zipCode: z.string().min(8, 'CEP inválido'),
  description: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
}).strict()

// 2. Horários de Funcionamento
const timeRangeSchema = z.object({
  open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
  close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
  pauseStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
  pauseEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato HH:MM').optional().or(z.literal('')),
})

export const businessHoursSchema = z.object({
  monday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
  tuesday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
  wednesday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
  thursday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
  friday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
  saturday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
  sunday: z.object({ isOpen: z.boolean() }).merge(timeRangeSchema.partial()),
})

// 3. Serviços
export const serviceSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  description: z.string().optional(),
  duration: z.number().min(15, 'Mínimo 15 minutos'),
  price: z.number().positive('Preço deve ser maior que zero'),
  category: z.enum(['corte', 'barba', 'combo', 'outros']),
  isActive: z.boolean().default(true),
})

// 4. Notificações
export const notificationPreferencesSchema = z.object({
  emailNewOrder: z.boolean().default(true),
  emailClientArrived: z.boolean().default(true),
  emailNewAppointment: z.boolean().default(true),
  emailCancellation: z.boolean().default(true),
  emailDailyReport: z.boolean().default(true),
  dailyReportTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).default('08:00'),
  whatsappConfirmations: z.boolean().default(false),
  whatsappReminders: z.boolean().default(false),
})

// 7. Perfil do Admin
export const adminProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().max(200).optional(),
})

export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>
export type BusinessHoursInput = z.infer<typeof businessHoursSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type AdminProfileInput = z.infer<typeof adminProfileSchema>
