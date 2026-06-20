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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    CompositeTypes: {
      [_ in never]: never
    },
    Enums: {
      [_ in never]: never
    },
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Tables: {
      [_ in never]: never
    },
    Views: {
      [_ in never]: never
    }
  }
  public: {
    CompositeTypes: {
      [_ in never]: never
    },
    Enums: {
      entry_kind: "sale" | "expense"
      payment_type: "cash" | "mercado_pago"
    },
    Functions: {
      create_entry_via_token: {
        Args: {
          p_amount: number
          p_kind: Database["public"]["Enums"]["entry_kind"]
          p_label: string
          p_occurred_on: string
          p_payment: Database["public"]["Enums"]["payment_type"]
          p_token: string
        }
        Returns: Database["public"]["Tables"]["entries"]["Row"]
      }
    }
    Tables: {
      api_tokens: {
        Insert: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string | null
          operator_id: string
          revoked_at?: string | null
          token_hash: string
        },
        Relationships: [
          {
            columns: ["operator_id"],
            foreignKeyName: "api_tokens_operator_id_fkey",
            isOneToOne: false
            referencedColumns: ["id"],
            referencedRelation: "operators"
          },
        ],
        Row: {
          created_at: string
          id: string
          last_used_at: string | null
          name: string | null
          operator_id: string
          revoked_at: string | null
          token_hash: string
        },
        Update: {
          created_at?: string
          id?: string
          last_used_at?: string | null
          name?: string | null
          operator_id?: string
          revoked_at?: string | null
          token_hash?: string
        }
      }
      entries: {
        Insert: {
          amount: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          kind: Database["public"]["Enums"]["entry_kind"]
          label: string
          occurred_on: string
          payment: Database["public"]["Enums"]["payment_type"]
          user_id: string
        },
        Relationships: [
          {
            columns: ["user_id"],
            foreignKeyName: "entries_user_id_fkey",
            isOneToOne: false
            referencedColumns: ["id"],
            referencedRelation: "operators"
          },
        ],
        Row: {
          amount: number
          created_at: string
          deleted_at: string | null
          id: string
          kind: Database["public"]["Enums"]["entry_kind"]
          label: string
          occurred_on: string
          payment: Database["public"]["Enums"]["payment_type"]
          user_id: string
        },
        Update: {
          amount?: number
          created_at?: string
          deleted_at?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["entry_kind"]
          label?: string
          occurred_on?: string
          payment?: Database["public"]["Enums"]["payment_type"]
          user_id?: string
        }
      }
      operators: {
        Insert: {
          created_at?: string
          currency?: string
          id: string
        },
        Relationships: [],
        Row: {
          created_at: string
          currency: string
          id: string
        },
        Update: {
          created_at?: string
          currency?: string
          id?: string
        }
      }
    },
    Views: {
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      entry_kind: ["sale", "expense"],
      payment_type: ["cash", "mercado_pago"],
    },
  },
} as const;
