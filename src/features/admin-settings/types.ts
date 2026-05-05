import { Database } from '@/types/database'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type Service = Database['public']['Tables']['services']['Row']

export interface BusinessHours {
  [key: string]: {
    isOpen: boolean
    open?: string
    close?: string
    pauseStart?: string
    pauseEnd?: string
  }
}

export interface NotificationPreferences {
  emailNewOrder: boolean
  emailClientArrived: boolean
  emailNewAppointment: boolean
  emailCancellation: boolean
  emailDailyReport: boolean
  dailyReportTime: string
  whatsappConfirmations: boolean
  whatsappReminders: boolean
}

export interface IntegrationStatus {
  whatsapp: {
    isConnected: boolean
    phoneNumber?: string
    lastPulse?: string
  }
}
