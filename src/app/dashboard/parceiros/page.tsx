"use client";

import { useState } from "react";
import { Users, Plus } from "lucide-react";
import DrawerParceiro from "@/components/DrawerParceiro";

export default function ParceirosPage() {
  const [drawerAberto, setDrawerAberto] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <Users className="text-[#A67B5B]" size={32} />
            Gestão de Parceiros
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Pessoas e empresas com quem você tem acordos financeiros.
          </p>
        </div>
        
        {/* O Botão que invoca o Drawer */}
        <button 
          onClick={() => setDrawerAberto(true)}
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Plus size={20} />
          <span>Novo Parceiro</span>
        </button>
      </div>

      {/* Aqui entrará a lista de parceiros futuramente */}
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
        <Users size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
        <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400">Nenhum parceiro cadastrado</h3>
        <p className="text-stone-400 dark:text-stone-500 text-sm mt-1">Clique no botão acima para adicionar.</p>
      </div>

      {/* O Componente do Drawer sendo injetado na tela */}
      <DrawerParceiro 
        aberto={drawerAberto} 
        fechar={() => setDrawerAberto(false)} 
      />

    </div>
  );
}