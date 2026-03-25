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
      const { data, error } = await supabase
        .from("perfil_global")
        .select("*")
        .limit(1)
        .single();

      if (data) {
        setPerfil({
          nome: data.nome,
          cargo: data.cargo,
          renda_mensal: parseFloat(data.renda_mensal),
        });
      }
    } catch (error) {
      console.error("Erro ao buscar perfil global:", error);
    } finally {
      // Pequeno delay para a animação Baply brilhar
      setTimeout(() => setCarregando(false), 800);
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