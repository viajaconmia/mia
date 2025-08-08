export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_info: {
        Row: {
          id: string;
          id_user: string; // ID de Supabase Auth
          id_viajero: string; // ID de tu base
          id_agente: string; // ID de tu base
        };
        Insert: {
          id?: string;
          id_user: string;
          id_viajero: string;
          id_agente: string;
        };
        Update: {
          id?: string;
          id_user?: string;
          id_viajero?: string;
          id_agente?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
