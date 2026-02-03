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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      achievements: {
        Row: {
          achievement_type: string
          earned_at: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      avatar_customizations: {
        Row: {
          background_color: string
          body: string
          clothing_color: string
          created_at: string
          eyes: string
          facial_hair: string
          hair: string
          hair_color: string
          id: string
          mouth: string
          nose: string
          skin_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          background_color: string
          body: string
          clothing_color: string
          created_at?: string
          eyes: string
          facial_hair: string
          hair: string
          hair_color: string
          id?: string
          mouth: string
          nose: string
          skin_color: string
          updated_at?: string
          user_id: string
        }
        Update: {
          background_color?: string
          body?: string
          clothing_color?: string
          created_at?: string
          eyes?: string
          facial_hair?: string
          hair?: string
          hair_color?: string
          id?: string
          mouth?: string
          nose?: string
          skin_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      book_api_cache: {
        Row: {
          created_at: string
          google_cached_at: string | null
          google_response: Json | null
          id: string
          isbn: string
          openlib_cached_at: string | null
          openlib_response: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          google_cached_at?: string | null
          google_response?: Json | null
          id?: string
          isbn: string
          openlib_cached_at?: string | null
          openlib_response?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          google_cached_at?: string | null
          google_response?: Json | null
          id?: string
          isbn?: string
          openlib_cached_at?: string | null
          openlib_response?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          completed_at: string | null
          cover_url: string | null
          created_at: string
          current_page: number | null
          description: string | null
          genres: string[] | null
          id: string
          is_completed: boolean | null
          isbn: string
          rating: number | null
          review: string | null
          title: string
          total_pages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          completed_at?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          description?: string | null
          genres?: string[] | null
          id?: string
          is_completed?: boolean | null
          isbn: string
          rating?: number | null
          review?: string | null
          title: string
          total_pages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          completed_at?: string | null
          cover_url?: string | null
          created_at?: string
          current_page?: number | null
          description?: string | null
          genres?: string[] | null
          id?: string
          is_completed?: boolean | null
          isbn?: string
          rating?: number | null
          review?: string | null
          title?: string
          total_pages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      canonical_books: {
        Row: {
          authors: string | null
          categories: string[] | null
          community_edited: boolean | null
          cover_url: string | null
          created_at: string
          description: string | null
          google_books_id: string | null
          id: string
          isbn: string | null
          last_edited_by: string | null
          missing_fields: string[] | null
          open_library_key: string | null
          page_count: number | null
          published_date: string | null
          source_google: boolean | null
          source_open_library: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          authors?: string | null
          categories?: string[] | null
          community_edited?: boolean | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          google_books_id?: string | null
          id?: string
          isbn?: string | null
          last_edited_by?: string | null
          missing_fields?: string[] | null
          open_library_key?: string | null
          page_count?: number | null
          published_date?: string | null
          source_google?: boolean | null
          source_open_library?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          authors?: string | null
          categories?: string[] | null
          community_edited?: boolean | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          google_books_id?: string | null
          id?: string
          isbn?: string | null
          last_edited_by?: string | null
          missing_fields?: string[] | null
          open_library_key?: string | null
          page_count?: number | null
          published_date?: string | null
          source_google?: boolean | null
          source_open_library?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_challenges: {
        Row: {
          challenge_date: string
          challenge_type: string
          completed_at: string | null
          created_at: string
          current_progress: number
          expires_at: string
          id: string
          is_completed: boolean
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          challenge_date?: string
          challenge_type: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          expires_at: string
          id?: string
          is_completed?: boolean
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          challenge_date?: string
          challenge_type?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          expires_at?: string
          id?: string
          is_completed?: boolean
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "friendships_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notes: {
        Row: {
          book_id: string
          content: string
          created_at: string
          id: string
          user_id: string | null
        }
        Insert: {
          book_id: string
          content: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Update: {
          book_id?: string
          content?: string
          created_at?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_seed: string | null
          avatar_type: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_goal_type: string | null
          daily_goal_value: number | null
          discoverable_by_friend_code: boolean | null
          display_name: string | null
          friend_code: string
          id: string
          notifications_achievements: boolean | null
          notifications_friend_activity: boolean | null
          notifications_reading_reminders: boolean | null
          notifications_weekly_summary: boolean | null
          progress_update_style: string | null
          reading_unit_preference: string | null
          show_spoiler_warnings: boolean | null
          text_size_preference: number | null
          theme_preference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_seed?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_goal_type?: string | null
          daily_goal_value?: number | null
          discoverable_by_friend_code?: boolean | null
          display_name?: string | null
          friend_code: string
          id?: string
          notifications_achievements?: boolean | null
          notifications_friend_activity?: boolean | null
          notifications_reading_reminders?: boolean | null
          notifications_weekly_summary?: boolean | null
          progress_update_style?: string | null
          reading_unit_preference?: string | null
          show_spoiler_warnings?: boolean | null
          text_size_preference?: number | null
          theme_preference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_seed?: string | null
          avatar_type?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_goal_type?: string | null
          daily_goal_value?: number | null
          discoverable_by_friend_code?: boolean | null
          display_name?: string | null
          friend_code?: string
          id?: string
          notifications_achievements?: boolean | null
          notifications_friend_activity?: boolean | null
          notifications_reading_reminders?: boolean | null
          notifications_weekly_summary?: boolean | null
          progress_update_style?: string | null
          reading_unit_preference?: string | null
          show_spoiler_warnings?: boolean | null
          text_size_preference?: number | null
          theme_preference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      progress_entries: {
        Row: {
          book_id: string
          created_at: string
          id: string
          logged_date: string | null
          notes: string | null
          pages_read: number
          time_spent_minutes: number | null
          user_id: string | null
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          logged_date?: string | null
          notes?: string | null
          pages_read: number
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          logged_date?: string | null
          notes?: string | null
          pages_read?: number
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "progress_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      reading_stats: {
        Row: {
          books_completed: number
          created_at: string
          id: string
          total_minutes: number
          total_pages: number
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          books_completed?: number
          created_at?: string
          id?: string
          total_minutes?: number
          total_pages?: number
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          books_completed?: number
          created_at?: string
          id?: string
          total_minutes?: number
          total_pages?: number
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_achievement: {
        Args: {
          p_achievement_type: string
          p_metadata?: Json
          p_user_id: string
        }
        Returns: string
      }
      ensure_reading_stats_for_week: { Args: never; Returns: undefined }
      generate_daily_challenge: { Args: { p_user_id: string }; Returns: string }
      generate_friend_code: { Args: never; Returns: string }
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
