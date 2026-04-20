// src/lib/database.types.ts
// TypeScript types that mirror the Supabase schema.
//
// NOTE: Once the project is more settled, you can auto-generate this file with:
//   npx supabase gen types typescript --project-id ppzgdwjojztugeyqvbdi > src/lib/database.types.ts
// For now we maintain it by hand to keep the dev loop tight.

export type ContentStatus = 'pending' | 'approved' | 'rejected';

export type CraftSlug =
  // Eight already drawn
  | 'las-abejas'
  | 'la-gallina'
  | 'el-pan'
  | 'la-conserva'
  | 'la-cisterna'
  | 'la-azuela'
  | 'el-telar'
  | 'las-yerbas'
  // Fourteen pending (schema uses ascii for jabon/jardin; no ñ in enum values)
  | 'el-huerto'
  | 'el-invernadero'
  | 'la-milpa'
  | 'el-rebano'
  | 'el-caldo'
  | 'la-mesa'
  | 'el-jabon'
  | 'el-candelero'
  | 'el-tractor'
  | 'la-regla'
  | 'las-medicinas'
  | 'la-escuela'
  | 'el-jardin'
  | 'la-mano';

export interface Database {
  public: {
    Tables: {
      parishes: {
        Row: {
          id: string;
          name: string;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          city?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          city?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string; // matches auth.users.id
          display_name: string | null;
          parish_id: string | null;
          bio: string | null;
          status: ContentStatus;
          is_admin: boolean;
          lat: number | null;
          lng: number | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          parish_id?: string | null;
          bio?: string | null;
          status?: ContentStatus;
          is_admin?: boolean;
          lat?: number | null;
          lng?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          parish_id?: string | null;
          bio?: string | null;
          status?: ContentStatus;
          is_admin?: boolean;
          lat?: number | null;
          lng?: number | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      expertise: {
        Row: {
          id: string;
          profile_id: string;
          craft: CraftSlug;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          craft: CraftSlug;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          craft?: CraftSlug;
          note?: string | null;
          created_at?: string;
        };
      };
      workshops: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string | null;
          craft: CraftSlug | null;
          parish_id: string | null;
          location_text: string | null;
          lat: number | null;
          lng: number | null;
          held_at: string;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description?: string | null;
          craft?: CraftSlug | null;
          parish_id?: string | null;
          location_text?: string | null;
          lat?: number | null;
          lng?: number | null;
          held_at: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string | null;
          craft?: CraftSlug | null;
          parish_id?: string | null;
          location_text?: string | null;
          lat?: number | null;
          lng?: number | null;
          held_at?: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      rsvps: {
        Row: {
          id: string;
          workshop_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          workshop_id: string;
          profile_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          workshop_id?: string;
          profile_id?: string;
          created_at?: string;
        };
      };
      witness_posts: {
        Row: {
          id: string;
          author_id: string;
          workshop_id: string | null;
          replicated_from_post_id: string | null;
          craft: CraftSlug | null;
          title: string | null;
          body: string;
          fruit_count: number | null;
          fruit_unit: string | null;
          occurred_at: string;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          workshop_id?: string | null;
          replicated_from_post_id?: string | null;
          craft?: CraftSlug | null;
          title?: string | null;
          body: string;
          fruit_count?: number | null;
          fruit_unit?: string | null;
          occurred_at: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          workshop_id?: string | null;
          replicated_from_post_id?: string | null;
          craft?: CraftSlug | null;
          title?: string | null;
          body?: string;
          fruit_count?: number | null;
          fruit_unit?: string | null;
          occurred_at?: string;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
      };
      attendees: {
        Row: {
          id: string;
          workshop_id: string;
          profile_id: string;
          attended: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          workshop_id: string;
          profile_id: string;
          attended?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          workshop_id?: string;
          profile_id?: string;
          attended?: boolean;
          created_at?: string;
        };
      };
    };
    Enums: {
      content_status: ContentStatus;
      craft_slug: CraftSlug;
    };
  };
}
