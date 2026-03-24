"use client";

import { useState, useEffect } from "react";
// 👇 Adicionado o 'User' aqui no import
import { FileSignature, Plus, Loader2, CalendarDays, Wallet, ArrowRight, User } from "lucide-react";
import DrawerContrato from "@/components/DrawerContrato";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ContratosPage() {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [contratos, setContratos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const buscarContratos = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("contratos")
      .select(`
        *,
        parceiros (nome)
      `)
      .order("criado_em", { ascending: false });

    if (data) setContratos(data);
    if (error) toast.error("Erro ao carregar contratos.");
    setCarregando(false);
  };

  useEffect(() => {
    buscarContratos();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <FileSignature className="text-[#A67B5B]" size={32} />
            Contratos & Acordos
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Gestão de valores, aluguéis e prazos de quitação.
          </p>
        </div>
        <button 
          onClick={() => setDrawerAberto(true)} 
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Plus size={20} />
          <span>Novo Acordo</span>
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#A67B5B]" size={40} />
        </div>
      ) : contratos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
          <FileSignature size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400">Nenhum contrato ativo</h3>
          <p className="text-stone-400 text-sm mt-1">Crie um acordo e atrele a um de seus parceiros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contratos.map((contrato) => (
            <div key={contrato.id} className="group p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl hover:border-[#A67B5B]/50 transition-all duration-300">
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 truncate pr-4">{contrato.titulo}</h3>
                  <p className="text-sm text-[#A67B5B] font-semibold mt-1 flex items-center gap-1">
                    <User size={14} /> {contrato.parceiros?.nome}
                  </p>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${contrato.status === 'ativo' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {contrato.status}
                </div>
              </div>

              <div className="py-4 border-t border-stone-100 dark:border-stone-800">
                <p className="text-3xl font-black text-stone-900 dark:text-stone-50">
                  R$ {contrato.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="space-y-3 pt-2 text-sm text-stone-600 dark:text-stone-400">
                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg">
                  <span className="flex items-center gap-2"><Wallet size={16}/> Parcelamento</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {contrato.quantidade_parcelas}x (R$ {(contrato.valor_total / contrato.quantidade_parcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                  </span>
                </div>
                <div className="flex justify-between items-center bg-stone-50 dark:bg-stone-950 p-2.5 rounded-lg">
                  <span className="flex items-center gap-2"><CalendarDays size={16}/> Vencimento</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">Todo dia {contrato.dia_vencimento}</span>
                </div>
              </div>

              <button className="mt-6 w-full flex items-center justify-between px-4 py-3 bg-stone-100 dark:bg-stone-800 hover:bg-[#A67B5B] hover:text-white text-stone-700 dark:text-stone-200 rounded-xl text-sm font-bold transition-all group-hover:shadow-md">
                <span>Ver Transações</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
              </button>

            </div>
          ))}
        </div>
      )}

      <DrawerContrato aberto={drawerAberto} fechar={() => setDrawerAberto(false)} aoSalvar={buscarContratos} />
    </div>
  );
}