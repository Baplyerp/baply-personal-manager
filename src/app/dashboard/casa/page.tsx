"use client";

import { useState, useEffect } from "react";
import { Home, Plus, Loader2, ClipboardCheck, Split, Activity, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CasaPage() {
  const [carregando, setCarregando] = useState(false);

  // Estados Simulados (Serão conectados ao BD depois)
  const eficiênciaSLA = 100; // 100% de tarefas no prazo
  const totalRateioPendente = 0; // Valor que precisam te pagar

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <Home className="text-[#A67B5B]" size={32} />
            Hub de Convivência & Operações
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Gestão de facilities, divisão de custos e eficiência operacional.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-5 py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold transition-all">
            <ClipboardCheck size={20} />
            <span className="hidden sm:inline">Nova Tarefa</span>
          </button>
          <button className="flex items-center gap-2 px-5 py-3 bg-[#A67B5B] hover:bg-[#8a6347] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            <Plus size={20} />
            <span>Dividir Conta</span>
          </button>
        </div>
      </div>

      {/* 📈 Painéis de SLA e Rateio */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card: SLA (Eficiência de Limpeza/Tarefas) */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default">
          <p className="text-sm font-semibold text-stone-500 flex items-center gap-2">
            <Activity size={16} className="text-emerald-500" /> 
            Eficiência Operacional (SLA)
          </p>
          <div className="mt-2 flex items-end gap-2">
            <p className="text-3xl font-black text-stone-800 dark:text-stone-100">
              {eficiênciaSLA}%
            </p>
            <p className="text-sm font-medium text-emerald-500 mb-1 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <Sparkles size={12}/> No Prazo
            </p>
          </div>
        </div>

        {/* Card: Contas A Receber do Rateio */}
        <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default">
          <p className="text-sm font-semibold text-stone-500 flex items-center gap-2">
            <Split size={16} className="text-[#A67B5B]" /> 
            Rateio a Receber
          </p>
          <p className="text-3xl font-black mt-2 text-stone-800 dark:text-stone-100">
            R$ {totalRateioPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

      </div>

      {/* Áreas Vazias que vamos construir */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="p-8 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl flex flex-col items-center justify-center text-center bg-white/50 dark:bg-stone-900/50">
          <ClipboardCheck size={40} className="text-stone-300 dark:text-stone-700 mb-4" />
          <h3 className="font-bold text-lg text-stone-700 dark:text-stone-300">Escala de Tarefas</h3>
          <p className="text-sm text-stone-500 mt-2 max-w-sm">
            Aqui vai ficar o algoritmo de rodízio de limpeza e manutenção da casa.
          </p>
        </div>

        <div className="p-8 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl flex flex-col items-center justify-center text-center bg-white/50 dark:bg-stone-900/50">
          <Split size={40} className="text-stone-300 dark:text-stone-700 mb-4" />
          <h3 className="font-bold text-lg text-stone-700 dark:text-stone-300">Rateio de Contas</h3>
          <p className="text-sm text-stone-500 mt-2 max-w-sm">
            Aqui vão ficar as faturas de Luz, Mercado e Internet, divididas automaticamente.
          </p>
        </div>

      </div>

    </div>
  );
}