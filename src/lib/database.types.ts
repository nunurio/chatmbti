export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
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
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      bot_personas: {
        Row: {
          assertiveness: number
          brevity: number
          created_at: string
          creativity: number
          description: string | null
          emoji_usage: number
          empathy: number
          formality: number
          humor: number
          id: string
          mbti_type: Database["public"]["Enums"]["mbti_code"] | null
          name: string
          owner_id: string | null
          rigor: number
          steps: number
          system_prompt_template: string | null
          updated_at: string
          version: number
          visibility: Database["public"]["Enums"]["visibility"]
          warmth: number
        }
        Insert: {
          assertiveness?: number
          brevity?: number
          created_at?: string
          creativity?: number
          description?: string | null
          emoji_usage?: number
          empathy?: number
          formality?: number
          humor?: number
          id?: string
          mbti_type?: Database["public"]["Enums"]["mbti_code"] | null
          name: string
          owner_id?: string | null
          rigor?: number
          steps?: number
          system_prompt_template?: string | null
          updated_at?: string
          version?: number
          visibility?: Database["public"]["Enums"]["visibility"]
          warmth?: number
        }
        Update: {
          assertiveness?: number
          brevity?: number
          created_at?: string
          creativity?: number
          description?: string | null
          emoji_usage?: number
          empathy?: number
          formality?: number
          humor?: number
          id?: string
          mbti_type?: Database["public"]["Enums"]["mbti_code"] | null
          name?: string
          owner_id?: string | null
          rigor?: number
          steps?: number
          system_prompt_template?: string | null
          updated_at?: string
          version?: number
          visibility?: Database["public"]["Enums"]["visibility"]
          warmth?: number
        }
        Relationships: []
      }
      mbti_answers: {
        Row: {
          created_at: string
          id: string
          question_id: string
          score: number
          test_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          score: number
          test_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          score?: number
          test_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mbti_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "mbti_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mbti_answers_test_id_fkey"
            columns: ["test_id"]
            isOneToOne: false
            referencedRelation: "mbti_tests"
            referencedColumns: ["id"]
          },
        ]
      }
      mbti_compatibilities: {
        Row: {
          score: number
          type_a: Database["public"]["Enums"]["mbti_code"]
          type_b: Database["public"]["Enums"]["mbti_code"]
        }
        Insert: {
          score: number
          type_a: Database["public"]["Enums"]["mbti_code"]
          type_b: Database["public"]["Enums"]["mbti_code"]
        }
        Update: {
          score?: number
          type_a?: Database["public"]["Enums"]["mbti_code"]
          type_b?: Database["public"]["Enums"]["mbti_code"]
        }
        Relationships: []
      }
      mbti_questions: {
        Row: {
          axis: Database["public"]["Enums"]["mbti_axis"]
          code: string | null
          created_at: string
          direction: number
          id: string
          is_active: boolean
          locale: string
          order: number
          text: string
          updated_at: string
        }
        Insert: {
          axis: Database["public"]["Enums"]["mbti_axis"]
          code?: string | null
          created_at?: string
          direction?: number
          id?: string
          is_active?: boolean
          locale?: string
          order: number
          text: string
          updated_at?: string
        }
        Update: {
          axis?: Database["public"]["Enums"]["mbti_axis"]
          code?: string | null
          created_at?: string
          direction?: number
          id?: string
          is_active?: boolean
          locale?: string
          order?: number
          text?: string
          updated_at?: string
        }
        Relationships: []
      }
      mbti_tests: {
        Row: {
          completed_at: string | null
          created_at: string
          determined_type: Database["public"]["Enums"]["mbti_code"] | null
          id: string
          scores: Json | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          determined_type?: Database["public"]["Enums"]["mbti_code"] | null
          id?: string
          scores?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          determined_type?: Database["public"]["Enums"]["mbti_code"] | null
          id?: string
          scores?: Json | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_feedback: {
        Row: {
          created_at: string
          id: string
          message_id: string
          rating: number
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          rating: number
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          rating?: number
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          content_json: Json | null
          created_at: string
          error: string | null
          id: string
          model: string | null
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
          tokens_completion: number | null
          tokens_prompt: number | null
        }
        Insert: {
          content: string
          content_json?: Json | null
          created_at?: string
          error?: string | null
          id?: string
          model?: string | null
          role: Database["public"]["Enums"]["message_role"]
          session_id: string
          tokens_completion?: number | null
          tokens_prompt?: number | null
        }
        Update: {
          content?: string
          content_json?: Json | null
          created_at?: string
          error?: string | null
          id?: string
          model?: string | null
          role?: Database["public"]["Enums"]["message_role"]
          session_id?: string
          tokens_completion?: number | null
          tokens_prompt?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          handle: string | null
          id: string
          is_public: boolean
          last_seen_at: string | null
          mbti_type: Database["public"]["Enums"]["mbti_code"] | null
          preferences: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id: string
          is_public?: boolean
          last_seen_at?: string | null
          mbti_type?: Database["public"]["Enums"]["mbti_code"] | null
          preferences?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          handle?: string | null
          id?: string
          is_public?: boolean
          last_seen_at?: string | null
          mbti_type?: Database["public"]["Enums"]["mbti_code"] | null
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          last_message_at: string | null
          message_count: number
          model: string | null
          persona_id: string | null
          status: Database["public"]["Enums"]["session_status"]
          temperature: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number
          model?: string | null
          persona_id?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          temperature?: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_message_at?: string | null
          message_count?: number
          model?: string | null
          persona_id?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          temperature?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_persona_id_fkey"
            columns: ["persona_id"]
            isOneToOne: false
            referencedRelation: "bot_personas"
            referencedColumns: ["id"]
          },
        ]
      }
      sse_events: {
        Row: {
          created_at: string
          detail: string | null
          event_type: string
          id: string
          request_id: string | null
          session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          event_type: string
          id?: string
          request_id?: string | null
          session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          event_type?: string
          id?: string
          request_id?: string | null
          session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sse_events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["role_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["role_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["role_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      citext: {
        Args: { "": boolean } | { "": string } | { "": unknown }
        Returns: string
      }
      citext_hash: {
        Args: { "": string }
        Returns: number
      }
      citextin: {
        Args: { "": unknown }
        Returns: string
      }
      citextout: {
        Args: { "": string }
        Returns: unknown
      }
      citextrecv: {
        Args: { "": unknown }
        Returns: string
      }
      citextsend: {
        Args: { "": string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      post_user_message: {
        Args: { p_content: string; p_session_id: string }
        Returns: string
      }
    }
    Enums: {
      mbti_axis: "EI" | "SN" | "TF" | "JP"
      mbti_code:
        | "INTJ"
        | "INTP"
        | "ENTJ"
        | "ENTP"
        | "INFJ"
        | "INFP"
        | "ENFJ"
        | "ENFP"
        | "ISTJ"
        | "ISFJ"
        | "ESTJ"
        | "ESFJ"
        | "ISTP"
        | "ISFP"
        | "ESTP"
        | "ESFP"
      message_role: "user" | "assistant" | "system" | "tool"
      role_type: "user" | "admin"
      session_status: "active" | "archived"
      visibility: "private" | "public"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      mbti_axis: ["EI", "SN", "TF", "JP"],
      mbti_code: [
        "INTJ",
        "INTP",
        "ENTJ",
        "ENTP",
        "INFJ",
        "INFP",
        "ENFJ",
        "ENFP",
        "ISTJ",
        "ISFJ",
        "ESTJ",
        "ESFJ",
        "ISTP",
        "ISFP",
        "ESTP",
        "ESFP",
      ],
      message_role: ["user", "assistant", "system", "tool"],
      role_type: ["user", "admin"],
      session_status: ["active", "archived"],
      visibility: ["private", "public"],
    },
  },
} as const

