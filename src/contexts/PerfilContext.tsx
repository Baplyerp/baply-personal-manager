"use client";

import { createContext, useContext, useState, useEffect } from "react";

type PerfilContextType = {
  carregando: boolean;
};

const PerfilContext = createContext<PerfilContextType>({ carregando: true });

export function PerfilProvider({ children }: { children: React.ReactNode }) {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setCarregando(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PerfilContext.Provider value={{ carregando }}>
      {children}
    </PerfilContext.Provider>
  );
}

export const usePerfil = () => useContext(PerfilContext);