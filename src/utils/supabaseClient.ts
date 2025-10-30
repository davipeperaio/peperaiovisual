import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          permissao: 'admin' | 'visualizador';
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['usuarios']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['usuarios']['Insert']>;
      };
      funcionarios: {
        Row: {
          id: string;
          nome: string;
          categoria: 'clt' | 'contrato' | 'dono';
          cargo: string;
          salario_mensal: number | null;
          valor_diaria: number | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['funcionarios']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['funcionarios']['Insert']>;
      };
      vales: {
        Row: {
          id: string;
          funcionario_id: string;
          valor: number;
          data: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['vales']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['vales']['Insert']>;
      };
      saidas_dono: {
        Row: {
          id: string;
          funcionario_id: string;
          valor: number;
          data: string;
          observacao: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['saidas_dono']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['saidas_dono']['Insert']>;
      };
      transacoes: {
        Row: {
          id: string;
          tipo: 'entrada' | 'saida';
          valor: number;
          origem: string;
          data: string;
          observacao: string | null;
          categoria: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['transacoes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['transacoes']['Insert']>;
      };
      categorias: {
        Row: {
          id: string;
          nome: string;
          tipo: 'entrada' | 'saida' | 'ambos';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categorias']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categorias']['Insert']>;
      };
      dividas: {
        Row: {
          id: string;
          nome: string;
          valor: number;
          vencimento: string;
          status: 'em_dia' | 'atrasado' | 'quitado';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['dividas']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['dividas']['Insert']>;
      };
      obras: {
        Row: {
          id: string;
          nome: string;
          orcamento: number;
          lucro: number;
          finalizada: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['obras']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['obras']['Insert']>;
      };
      gastos_obra: {
        Row: {
          id: string;
          obra_id: string;
          categoria: string;
          descricao: string;
          valor: number;
          data: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['gastos_obra']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['gastos_obra']['Insert']>;
      };
      recebiveis: {
        Row: {
          id: string;
          cliente: string;
          valor_total: number;
          valor_pago: number;
          data_criacao: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['recebiveis']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['recebiveis']['Insert']>;
      };
      pagamentos_recebivel: {
        Row: {
          id: string;
          recebivel_id: string;
          valor: number;
          data: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['pagamentos_recebivel']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['pagamentos_recebivel']['Insert']>;
      };
    };
  };
}

// Helper functions for local storage fallback (development mode)
export const useLocalStorage = !supabaseUrl || supabaseUrl === 'YOUR_SUPABASE_URL';

// Upload file to Supabase Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return publicUrl;
}

// Get public URL from Supabase Storage
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
