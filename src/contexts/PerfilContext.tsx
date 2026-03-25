"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type DadosPerfil = {
  nome: string;
  cargo: string;
  renda_mensal: number;
  avatar_url?: string;
  empresa_nome?: string;
  setor?: string;             // 👈 O novo campo adicionado aqui!
  empresa_logo_url?: string;
  local_trabalho?: string;
  gestor_imediato?: string;
};

type PerfilContextType = {
  carregando: boolean;
  perfil: DadosPerfil | null;
  atualizarPerfil: () => Promise<void>;
};

const PerfilContext = createContext<PerfilContextType>({ 
  carregando: true, 
  perfil: null,
  atualizarPerfil: async () => {} 
});

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [perfil, setPerfil] = useState<DadosPerfil | null>(null);

  const buscarPerfil = async () => {
    try {
      // Usamos limit(1) em vez de .single() para evitar erro de "linha não encontrada" caso o banco esteja vazio
      const { data, error } = await supabase
        .from("perfil_global")
        .select("*")
        .limit(1);

      if (error) throw error;
      
      // Se encontrou dados, salva no contexto. Se não, deixa null.
      if (data && data.length > 0) {
        setPerfil(data[0]);
      } else {
        setPerfil(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil global:", error);
    }
  };

  useEffect(() => {
    buscarPerfil();
  }, []);

  return (
    <PerfilContext.Provider value={{ carregando, perfil, atualizarPerfil: buscarPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
}

export const usePerfil = () => useContext(PerfilContext);