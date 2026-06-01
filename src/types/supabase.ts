export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          role: 'admin' | 'barber' | 'client'
          organization_id: string
          notification_preferences: Record<string, unknown> | null
          bio: string | null
          status: string | null
          specialty: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'barber' | 'client'
          organization_id: string
          notification_preferences?: Record<string, unknown> | null
          bio?: string | null
          status?: string | null
          specialty?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'barber' | 'client'
          organization_id?: string
          notification_preferences?: Record<string, unknown> | null
          bio?: string | null
          status?: string | null
          specialty?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          loyalty_config: Record<string, unknown> | null
          status: string | null
          business_hours: Record<string, unknown> | null
          phone: string | null
          address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          loyalty_config?: Record<string, unknown> | null
          status?: string | null
          business_hours?: Record<string, unknown> | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          loyalty_config?: Record<string, unknown> | null
          status?: string | null
          business_hours?: Record<string, unknown> | null
          phone?: string | null
          address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          organization_id: string
          profile_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          birthday: string | null
          notes: string | null
          preferred_barber_id: string | null
          status: 'active' | 'inactive' | 'blocked'
          total_visits: number
          total_spent_cents: number
          last_visit_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          profile_id?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          birthday?: string | null
          notes?: string | null
          preferred_barber_id?: string | null
          status?: 'active' | 'inactive' | 'blocked'
          total_visits?: number
          total_spent_cents?: number
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          profile_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string | null
          birthday?: string | null
          notes?: string | null
          preferred_barber_id?: string | null
          status?: 'active' | 'inactive' | 'blocked'
          total_visits?: number
          total_spent_cents?: number
          last_visit_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'clients_preferred_barber_id_fkey'
            columns: ['preferred_barber_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      services: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          category: string | null
          duration_minutes: number
          price_cents: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          category?: string | null
          duration_minutes?: number
          price_cents?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          category?: string | null
          duration_minutes?: number
          price_cents?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          service_id: string
          barber_id: string
          start_time: string
          end_time: string | null
          duration_minutes: number
          price_cents: number | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          organization_id: string
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_id: string
          barber_id: string
          start_time: string
          end_time?: string | null
          duration_minutes?: number
          price_cents?: number | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          organization_id: string
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_id?: string
          barber_id?: string
          start_time?: string
          end_time?: string | null
          duration_minutes?: number
          price_cents?: number | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'no_show' | 'cancelled'
          organization_id?: string
          rating?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_barber_id_fkey'
            columns: ['barber_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      waiting_list: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          barber_id: string | null
          service_id: string
          position: number
          status: string
          estimated_wait_minutes: number | null
          arrived_at: string | null
          called_at: string | null
          served_at: string | null
          expires_at: string | null
          whatsapp_sent: boolean
          appointment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          barber_id?: string | null
          service_id: string
          position?: number
          status?: string
          estimated_wait_minutes?: number | null
          arrived_at?: string | null
          called_at?: string | null
          served_at?: string | null
          expires_at?: string | null
          whatsapp_sent?: boolean
          appointment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          barber_id?: string | null
          service_id?: string
          position?: number
          status?: string
          estimated_wait_minutes?: number | null
          arrived_at?: string | null
          called_at?: string | null
          served_at?: string | null
          expires_at?: string | null
          whatsapp_sent?: boolean
          appointment_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'waiting_list_barber_id_fkey'
            columns: ['barber_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waiting_list_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'waiting_list_service_id_fkey'
            columns: ['service_id']
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      loyalty_stamps: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          appointment_id: string | null
          type: 'stamp' | 'redeem'
          amount: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          appointment_id?: string | null
          type: 'stamp' | 'redeem'
          amount: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          appointment_id?: string | null
          type?: 'stamp' | 'redeem'
          amount?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      comanda_items: {
        Row: {
          id: string
          organization_id: string
          appointment_id: string | null
          client_id: string
          barber_id: string
          inventory_id: string | null
          item_type: 'service' | 'product'
          name: string
          quantity: number
          unit_price_cents: number
          total_cents: number
          paid: boolean
          paid_at: string | null
          payment_method: 'cash' | 'pix' | 'credit_card' | 'debit_card' | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          appointment_id?: string | null
          client_id: string
          barber_id: string
          inventory_id?: string | null
          item_type: 'service' | 'product'
          name: string
          quantity?: number
          unit_price_cents: number
          total_cents: number
          paid?: boolean
          paid_at?: string | null
          payment_method?: 'cash' | 'pix' | 'credit_card' | 'debit_card' | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          appointment_id?: string | null
          client_id?: string
          barber_id?: string
          inventory_id?: string | null
          item_type?: 'service' | 'product'
          name?: string
          quantity?: number
          unit_price_cents?: number
          total_cents?: number
          paid?: boolean
          paid_at?: string | null
          payment_method?: 'cash' | 'pix' | 'credit_card' | 'debit_card' | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comanda_items_appointment_id_fkey'
            columns: ['appointment_id']
            referencedRelation: 'appointments'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comanda_items_barber_id_fkey'
            columns: ['barber_id']
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comanda_items_client_id_fkey'
            columns: ['client_id']
            referencedRelation: 'clients'
            referencedColumns: ['id']
          }
        ]
      }
      inventory: {
        Row: {
          id: string
          organization_id: string
          name: string
          quantity: number
          min_quantity: number
          price_cents: number | null
          cost_cents: number | null
          type: string
          supplier: string | null
          supplier_phone: string | null
          description: string | null
          category: string | null
          active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          quantity?: number
          min_quantity?: number
          price_cents?: number | null
          cost_cents?: number | null
          type?: string
          supplier?: string | null
          supplier_phone?: string | null
          description?: string | null
          category?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          quantity?: number
          min_quantity?: number
          price_cents?: number | null
          cost_cents?: number | null
          type?: string
          supplier?: string | null
          supplier_phone?: string | null
          description?: string | null
          category?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          organization_id: string
          client_id: string
          channel: string
          direction: 'sent' | 'received'
          content: string
          template_used: string | null
          status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
          error_message: string | null
          sent_by: string | null
          sender_phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          client_id: string
          channel?: string
          direction: 'sent' | 'received'
          content: string
          template_used?: string | null
          status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
          error_message?: string | null
          sent_by?: string | null
          sender_phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          client_id?: string
          channel?: string
          direction?: 'sent' | 'received'
          content?: string
          template_used?: string | null
          status?: 'sent' | 'delivered' | 'read' | 'failed' | 'pending'
          error_message?: string | null
          sent_by?: string | null
          sender_phone?: string | null
          created_at?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          content: string
          trigger_type: string
          is_active: boolean
          is_system: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          content: string
          trigger_type?: string
          is_active?: boolean
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          content?: string
          trigger_type?: string
          is_active?: boolean
          is_system?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
