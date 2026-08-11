export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      businesses: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          phone: string | null
          email: string | null
          address: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
      }
      business_members: {
        Row: {
          id: string
          business_id: string
          user_id: string
          role: 'owner' | 'admin' | 'staff'
          status: 'active' | 'invited' | 'suspended'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          user_id: string
          role: 'owner' | 'admin' | 'staff'
          status?: 'active' | 'invited' | 'suspended'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'staff'
          status?: 'active' | 'invited' | 'suspended'
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          business_id: string
          plan: 'free' | 'pro' | 'business'
          status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
          started_at: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          plan?: 'free' | 'pro' | 'business'
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
          started_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          plan?: 'free' | 'pro' | 'business'
          status?: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired'
          started_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_usage: {
        Row: {
          id: string
          business_id: string
          period_start: string
          period_end: string
          chats_count: number
          products_count: number
          orders_count: number
          broadcasts_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          period_start: string
          period_end: string
          chats_count?: number
          products_count?: number
          orders_count?: number
          broadcasts_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          period_start?: string
          period_end?: string
          chats_count?: number
          products_count?: number
          orders_count?: number
          broadcasts_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_agents: {
        Row: {
          id: string
          business_id: string
          name: string
          avatar_url: string | null
          personality: 'friendly' | 'professional' | 'playful'
          language: 'id' | 'en' | 'mixed'
          greeting: string | null
          status: 'draft' | 'ready' | 'active' | 'paused'
          deployed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          avatar_url?: string | null
          personality: 'friendly' | 'professional' | 'playful'
          language: 'id' | 'en' | 'mixed'
          greeting?: string | null
          status?: 'draft' | 'ready' | 'active' | 'paused'
          deployed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          avatar_url?: string | null
          personality?: 'friendly' | 'professional' | 'playful'
          language?: 'id' | 'en' | 'mixed'
          greeting?: string | null
          status?: 'draft' | 'ready' | 'active' | 'paused'
          deployed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_business_knowledge: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          content: string | null
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          content?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          content?: string | null
          version?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_faqs: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          question: string
          answer: string
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          question: string
          answer: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          question?: string
          answer?: string
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_rules: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          rule_type: 'prohibited_topic' | 'custom_instruction' | 'escalation_rule'
          content: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          rule_type: 'prohibited_topic' | 'custom_instruction' | 'escalation_rule'
          content: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          rule_type?: 'prohibited_topic' | 'custom_instruction' | 'escalation_rule'
          content?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_operating_hours: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          day_of_week: number
          is_open: boolean
          start_time: string | null
          end_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          day_of_week: number
          is_open?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          day_of_week?: number
          is_open?: boolean
          start_time?: string | null
          end_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_settings: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          share_price_without_request: boolean
          active_24_hours: boolean
          after_hours_message: string | null
          escalation_enabled: boolean
          uncertainty_threshold: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          share_price_without_request?: boolean
          active_24_hours?: boolean
          after_hours_message?: string | null
          escalation_enabled?: boolean
          uncertainty_threshold?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          share_price_without_request?: boolean
          active_24_hours?: boolean
          after_hours_message?: string | null
          escalation_enabled?: boolean
          uncertainty_threshold?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_knowledge_documents: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          status: 'uploading' | 'processing' | 'learned' | 'failed'
          extracted_text: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          status?: 'uploading' | 'processing' | 'learned' | 'failed'
          extracted_text?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          status?: 'uploading' | 'processing' | 'learned' | 'failed'
          extracted_text?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_test_sessions: {
        Row: {
          id: string
          business_id: string
          agent_id: string | null
          total_tests: number
          successful_tests: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          agent_id?: string | null
          total_tests?: number
          successful_tests?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          agent_id?: string | null
          total_tests?: number
          successful_tests?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_test_messages: {
        Row: {
          id: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          response_source: string | null
          response_time_ms: number | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          role: 'user' | 'assistant'
          content: string
          response_source?: string | null
          response_time_ms?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          role?: 'user' | 'assistant'
          content?: string
          response_source?: string | null
          response_time_ms?: number | null
          created_at?: string
        }
      }
      ai_test_results: {
        Row: {
          id: string
          session_id: string
          message_id: string
          rating: 'pass' | 'fail'
          created_at: string
        }
        Insert: {
          id?: string
          session_id?: string
          message_id: string
          rating: 'pass' | 'fail'
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          message_id?: string
          rating?: 'pass' | 'fail'
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          business_id: string
          name: string
          slug: string
          description: string | null
          normal_price: number
          discount_price: number | null
          stock: number
          unit: string
          category: string | null
          weight_grams: number | null
          status: 'active' | 'out_of_stock' | 'draft' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          slug: string
          description?: string | null
          normal_price: number
          discount_price?: number | null
          stock?: number
          unit?: string
          category?: string | null
          weight_grams?: number | null
          status?: 'active' | 'out_of_stock' | 'draft' | 'inactive'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          slug?: string
          description?: string | null
          normal_price?: number
          discount_price?: number | null
          stock?: number
          unit?: string
          category?: string | null
          weight_grams?: number | null
          status?: 'active' | 'out_of_stock' | 'draft' | 'inactive'
          created_at?: string
          updated_at?: string
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          business_id: string
          storage_path: string
          file_name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          business_id: string
          storage_path: string
          file_name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          business_id?: string
          storage_path?: string
          file_name?: string
          sort_order?: number
          created_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          business_id: string
          name: string
          sku: string | null
          price_override: number | null
          stock: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          business_id: string
          name: string
          sku?: string | null
          price_override?: number | null
          stock?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          business_id?: string
          name?: string
          sku?: string | null
          price_override?: number | null
          stock?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_tags: {
        Row: {
          id: string
          product_id: string
          business_id: string
          tag: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          business_id: string
          tag: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          business_id?: string
          tag?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessMember = Database['public']['Tables']['business_members']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SubscriptionUsage = Database['public']['Tables']['subscription_usage']['Row']

export type AIAgent = Database['public']['Tables']['ai_agents']['Row']
export type AIBusinessKnowledge = Database['public']['Tables']['ai_business_knowledge']['Row']
export type AIFAQ = Database['public']['Tables']['ai_faqs']['Row']
export type AIRule = Database['public']['Tables']['ai_rules']['Row']
export type AIOperatingHours = Database['public']['Tables']['ai_operating_hours']['Row']
export type AISettings = Database['public']['Tables']['ai_settings']['Row']
export type AIKnowledgeDocument = Database['public']['Tables']['ai_knowledge_documents']['Row']
export type AITestSession = Database['public']['Tables']['ai_test_sessions']['Row']
export type AITestMessage = Database['public']['Tables']['ai_test_messages']['Row']
export type AITestResult = Database['public']['Tables']['ai_test_results']['Row']

export type Product = Database['public']['Tables']['products']['Row']
export type ProductImage = Database['public']['Tables']['product_images']['Row']
export type ProductVariant = Database['public']['Tables']['product_variants']['Row']
export type ProductTag = Database['public']['Tables']['product_tags']['Row']
