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
      activities: {
        Row: {
          id: string
          user_id: string
          category: 'transport' | 'waste' | 'diet' | 'energy'
          activity_type: string
          value: number
          carbon_impact: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: 'transport' | 'waste' | 'diet' | 'energy'
          activity_type: string
          value: number
          carbon_impact: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: 'transport' | 'waste' | 'diet' | 'energy'
          activity_type?: string
          value?: number
          carbon_impact?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          total_carbon_saved: number
          level: number
          created_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          total_carbon_saved?: number
          level?: number
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          total_carbon_saved?: number
          level?: number
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          carbon_required: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          carbon_required: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          carbon_required?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
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
  }
}