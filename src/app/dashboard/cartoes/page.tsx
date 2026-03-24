"use client";

import { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2, Wallet, Building, Wifi } from "lucide-react";
import DrawerConta from "@/components/DrawerConta";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function CartoesPage() {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [contas, setContas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const buscarContratos = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("contas_cartoes")
      .select("*")
      .order("criado_em", { ascending: false });

    if (data) setContas(data);
    if (error) toast.error("Erro ao carregar fontes financeiras.");
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
            <CreditCard className="text-[#A67B5B]" size={32} />
            Carteiras & Cartões
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Estrutura de liquidez e limites de crédito.
          </p>
        </div>
        <button 
          onClick={() => setDrawerAberto(true)} 
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Plus size={20} />
          <span>Nova Fonte</span>
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#A67B5B]" size={40} />
        </div>
      ) : contas.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
          <Wallet size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400">Nenhuma fonte cadastrada</h3>
          <p className="text-stone-400 text-sm mt-1">Adicione seus cartões, contas correntes ou VAs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contas.map((conta) => (
            <div 
              key={conta.id} 
              // O pulo do gato: Se for crédito, aplica a cor personalizada como background com efeito de vidro
              className={`group relative p-6 rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${
                conta.tipo === 'credito' 
                  ? 'text-white border-white/20' 
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100'
              }`}
              style={conta.tipo === 'credito' ? { backgroundColor: conta.cor_tema } : {}}
            >
              
              {/* Efeitos visuais para o cartão de crédito */}
              {conta.tipo === 'credito' && (
                <>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-10 -mt-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-10 -mb-10" />
                </>
              )}

              <div className="relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl tracking-tight">{conta.nome}</h3>
                    <p className={`text-xs font-semibold uppercase mt-1 px-2 py-0.5 inline-block rounded-md ${conta.tipo === 'credito' ? 'bg-white/20' : 'bg-stone-100 dark:bg-stone-800 text-[#A67B5B]'}`}>
                      {conta.tipo === 'vr' ? 'Vale Refeição' : conta.tipo === 'va' ? 'Vale Alimentação' : conta.tipo}
                    </p>
                  </div>
                  {conta.tipo === 'credito' ? <Wifi size={24} className="opacity-70 rotate-90" /> : <Building size={24} className="opacity-40" />}
                </div>

                <div className="mt-8">
                  {conta.tipo === 'credito' ? (
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs opacity-80 mb-1">Limite Total</p>
                        <p className="font-mono text-2xl font-bold">R$ {conta.limite_credito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div className="text-right text-xs opacity-90 font-medium">
                        <p>Fecha: Dia {conta.dia_fechamento}</p>
                        <p>Vence: Dia {conta.dia_vencimento}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm opacity-60 dark:opacity-40">
                      <span>**** **** **** ****</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DrawerConta aberto={drawerAberto} fechar={() => setDrawerAberto(false)} aoSalvar={buscarContratos} />
    </div>
  );
}