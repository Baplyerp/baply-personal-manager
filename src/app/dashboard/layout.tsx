"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { usePerfil } from "@/contexts/PerfilContext";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { carregando } = usePerfil();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 font-sans text-stone-900 dark:text-stone-100 animate-in fade-in duration-500">
      
      {/* Passamos as funções para o Header e a Sidebar conversarem */}
      <Header abrirMenu={() => setMenuAberto(true)} />
      <Sidebar aberto={menuAberto} fecharMenu={() => setMenuAberto(false)} />
      
      {/* Ajuste do padding principal: no celular o menu some (pl-0), no PC ele tem 104px (md:pl-[104px]) */}
      <main className="pt-24 px-4 md:pl-[104px] md:pr-8 pb-8 transition-all duration-300 relative min-h-screen">
        <div className="max-w-7xl mx-auto">
          
          {carregando ? (
            <div className="flex flex-col items-center justify-center pt-32 animate-in fade-in duration-300">
              <Loader2 className="animate-spin text-[#A67B5B] mb-4" size={40} />
              <p className="text-stone-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                Sincronizando Workspace...
              </p>
            </div>
          ) : (
            children
          )}
          
        </div>
      </main>
    </div>
  );
}