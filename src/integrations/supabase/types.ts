export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      credit_settings: {
        Row: {
          created_at: string | null
          credits_per_unit: number
          currency: string
          family_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_per_unit?: number
          currency?: string
          family_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_per_unit?: number
          currency?: string
          family_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_settings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: true
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_chore_requests: {
        Row: {
          approved_at: string | null
          category: string
          completed_at: string | null
          created_at: string
          credits: number
          estimated_time: string | null
          family_id: string
          id: string
          kid_id: string
          kid_note: string | null
          last_requested_at: string
          parent_note: string | null
          status: string
          template_id: string | null
          title: string
        }
        Insert: {
          approved_at?: string | null
          category: string
          completed_at?: string | null
          created_at?: string
          credits: number
          estimated_time?: string | null
          family_id: string
          id?: string
          kid_id: string
          kid_note?: string | null
          last_requested_at?: string
          parent_note?: string | null
          status?: string
          template_id?: string | null
          title: string
        }
        Update: {
          approved_at?: string | null
          category?: string
          completed_at?: string | null
          created_at?: string
          credits?: number
          estimated_time?: string | null
          family_id?: string
          id?: string
          kid_id?: string
          kid_note?: string | null
          last_requested_at?: string
          parent_note?: string | null
          status?: string
          template_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "extra_chore_requests_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_chore_requests_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extra_chore_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "extra_chore_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      extra_chore_templates: {
        Row: {
          category: string
          created_at: string
          credits: number
          description: string | null
          estimated_time: string | null
          id: string
          supervised_only: boolean
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          credits: number
          description?: string | null
          estimated_time?: string | null
          id?: string
          supervised_only?: boolean
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          credits?: number
          description?: string | null
          estimated_time?: string | null
          id?: string
          supervised_only?: boolean
          title?: string
        }
        Relationships: []
      }
      families: {
        Row: {
          country: string | null
          created_at: string | null
          family_code: string
          family_name: string
          id: string
          parent_id: string
          updated_at: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string | null
          family_code: string
          family_name: string
          id?: string
          parent_id: string
          updated_at?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string | null
          family_code?: string
          family_name?: string
          id?: string
          parent_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      family_reward_requests: {
        Row: {
          approved_at: string | null
          family_reward_id: string
          fulfilled_at: string | null
          id: string
          kid_id: string
          parent_note: string | null
          requested_at: string | null
          status: string
        }
        Insert: {
          approved_at?: string | null
          family_reward_id: string
          fulfilled_at?: string | null
          id?: string
          kid_id: string
          parent_note?: string | null
          requested_at?: string | null
          status?: string
        }
        Update: {
          approved_at?: string | null
          family_reward_id?: string
          fulfilled_at?: string | null
          id?: string
          kid_id?: string
          parent_note?: string | null
          requested_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_reward_requests_family_reward_id_fkey"
            columns: ["family_reward_id"]
            isOneToOne: false
            referencedRelation: "family_rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_reward_requests_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      family_reward_templates: {
        Row: {
          category: string | null
          created_at: string | null
          default_credits: number
          icon_name: string | null
          id: string
          tier: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_credits: number
          icon_name?: string | null
          id?: string
          tier: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_credits?: number
          icon_name?: string | null
          id?: string
          tier?: string
          title?: string
        }
        Relationships: []
      }
      family_rewards: {
        Row: {
          created_at: string | null
          created_from_template_id: string | null
          credits_cost: number
          family_id: string
          icon_name: string | null
          id: string
          is_active: boolean | null
          tier: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_from_template_id?: string | null
          credits_cost: number
          family_id: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          tier?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_from_template_id?: string | null
          credits_cost?: number
          family_id?: string
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          tier?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_rewards_created_from_template_id_fkey"
            columns: ["created_from_template_id"]
            isOneToOne: false
            referencedRelation: "family_reward_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_rewards_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      kid_wishlist_items: {
        Row: {
          created_at: string
          credits_goal: number
          id: string
          kid_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credits_goal: number
          id?: string
          kid_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credits_goal?: number
          id?: string
          kid_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "kid_wishlist_items_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      kids: {
        Row: {
          age: number
          anonymous_uid: string | null
          avatar: string
          created_at: string | null
          credits_balance: number | null
          family_id: string
          id: string
          interests: string[] | null
          name: string
          onboarding_completed_at: string | null
          pin_hash: string
          updated_at: string | null
        }
        Insert: {
          age: number
          anonymous_uid?: string | null
          avatar: string
          created_at?: string | null
          credits_balance?: number | null
          family_id: string
          id?: string
          interests?: string[] | null
          name: string
          onboarding_completed_at?: string | null
          pin_hash: string
          updated_at?: string | null
        }
        Update: {
          age?: number
          anonymous_uid?: string | null
          avatar?: string
          created_at?: string | null
          credits_balance?: number | null
          family_id?: string
          id?: string
          interests?: string[] | null
          name?: string
          onboarding_completed_at?: string | null
          pin_hash?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kids_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      login_attempts: {
        Row: {
          attempt_time: string
          id: string
          kid_id: string
          success: boolean
        }
        Insert: {
          attempt_time?: string
          id?: string
          kid_id: string
          success?: boolean
        }
        Update: {
          attempt_time?: string
          id?: string
          kid_id?: string
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "login_attempts_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      parent_deals: {
        Row: {
          created_at: string | null
          credits_goal: number | null
          credits_paid: number
          family_id: string
          id: string
          item_name: string
          kid_id: string
          kid_note: string | null
          parent_note: string | null
          real_cost: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credits_goal?: number | null
          credits_paid?: number
          family_id: string
          id?: string
          item_name: string
          kid_id: string
          kid_note?: string | null
          parent_note?: string | null
          real_cost?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credits_goal?: number | null
          credits_paid?: number
          family_id?: string
          id?: string
          item_name?: string
          kid_id?: string
          kid_note?: string | null
          parent_note?: string | null
          real_cost?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parent_deals_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_deals_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available: boolean | null
          category: string
          cost_credits: number
          created_at: string | null
          description: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          name: string
          redemption_code: string | null
          updated_at: string | null
        }
        Insert: {
          available?: boolean | null
          category: string
          cost_credits: number
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name: string
          redemption_code?: string | null
          updated_at?: string | null
        }
        Update: {
          available?: boolean | null
          category?: string
          cost_credits?: number
          created_at?: string | null
          description?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          name?: string
          redemption_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          role: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          role: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          role?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      redemptions: {
        Row: {
          approved_at: string | null
          cost_credits: number
          denied_at: string | null
          family_id: string
          id: string
          kid_id: string
          parent_note: string | null
          product_id: string
          product_image: string | null
          product_name: string
          redemption_code: string | null
          requested_at: string | null
          status: string
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          approved_at?: string | null
          cost_credits: number
          denied_at?: string | null
          family_id: string
          id?: string
          kid_id: string
          parent_note?: string | null
          product_id: string
          product_image?: string | null
          product_name: string
          redemption_code?: string | null
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          approved_at?: string | null
          cost_credits?: number
          denied_at?: string | null
          family_id?: string
          id?: string
          kid_id?: string
          parent_note?: string | null
          product_id?: string
          product_image?: string | null
          product_name?: string
          redemption_code?: string | null
          requested_at?: string | null
          status?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          celebration_seen: boolean
          completed_at: string | null
          created_at: string | null
          credits_reward: number
          deadline: string | null
          description: string | null
          family_id: string
          id: string
          kid_id: string
          kid_note: string | null
          parent_note: string | null
          photo_required: boolean | null
          photo_url: string | null
          recurring_frequency: string | null
          status: string
          submitted_at: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          celebration_seen?: boolean
          completed_at?: string | null
          created_at?: string | null
          credits_reward: number
          deadline?: string | null
          description?: string | null
          family_id: string
          id?: string
          kid_id: string
          kid_note?: string | null
          parent_note?: string | null
          photo_required?: boolean | null
          photo_url?: string | null
          recurring_frequency?: string | null
          status?: string
          submitted_at?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          celebration_seen?: boolean
          completed_at?: string | null
          created_at?: string | null
          credits_reward?: number
          deadline?: string | null
          description?: string | null
          family_id?: string
          id?: string
          kid_id?: string
          kid_note?: string | null
          parent_note?: string | null
          photo_required?: boolean | null
          photo_url?: string | null
          recurring_frequency?: string | null
          status?: string
          submitted_at?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_kid_id_fkey"
            columns: ["kid_id"]
            isOneToOne: false
            referencedRelation: "kids"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_kid_onboarding: { Args: { kid_id: string }; Returns: undefined }
      increment_kid_credits: {
        Args: { amount: number; kid_id: string }
        Returns: undefined
      }
      mark_celebration_seen: { Args: { task_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
