"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type DadosPerfil = {
  nome: string;
  cargo: string;
  renda_mensal: number;
  avatar_url?: string;
  empresa_nome?: string;
  setor?: string;
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
      const { data, error } = await supabase
        .from("perfil_global")
        .select("*")
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setPerfil(data[0]);
      } else {
        setPerfil(null);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil global:", error);
    } finally {
      setCarregando(false); // ✅ Fix aplicado aqui!
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