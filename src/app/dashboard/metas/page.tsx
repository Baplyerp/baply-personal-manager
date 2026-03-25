"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Loader2, TrendingUp, PiggyBank } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function MetasPage() {
  const [metas, setMetas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const buscarMetas = async () => {
    setCarregando(true);
    const { data, error } = await supabase.from("metas").select("*").order("data_limite", { ascending: true });
    if (data) setMetas(data);
    if (error) toast.error("Erro ao carregar metas.");
    setCarregando(false);
  };

  useEffect(() => {
    buscarMetas();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <Target className="text-[#A67B5B]" size={32} />
            Patrimônio & Metas
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Acompanhamento de reservas, poupança e evolução patrimonial.
          </p>
        </div>
        <button 
          onClick={() => toast.info("Em breve: Formulário de criação de metas!")} 
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Plus size={20} />
          <span>Nova Meta</span>
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#A67B5B]" size={40} /></div>
      ) : metas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
          <PiggyBank size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-300">Nenhum alvo definido</h3>
          <p className="text-stone-500 text-sm mt-2 max-w-md text-center">
            Defina sua Reserva de Emergência, fundos para mudança e objetivos de médio a longo prazo para visualizar as barras de progresso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* O Grid será alimentado futuramente */}
        </div>
      )}
    </div>
  );
}