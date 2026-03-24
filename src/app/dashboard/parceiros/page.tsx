"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Edit2, Trash2, ShieldAlert, HeartHandshake, Building, Briefcase, Loader2, Send } from "lucide-react";
import DrawerParceiro from "@/components/DrawerParceiro";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Inteligência de mapeamento visual da relação
const relacaoConfig: any = {
  credor: { cor: "text-red-500 bg-red-100 dark:bg-red-500/10", icone: ShieldAlert, label: "Risco/Dívida" },
  familiar: { cor: "text-purple-500 bg-purple-100 dark:bg-purple-500/10", icone: HeartHandshake, label: "Apoio/Flexível" },
  locador: { cor: "text-blue-500 bg-blue-100 dark:bg-blue-500/10", icone: Building, label: "Contrato Fixo" },
  servico: { cor: "text-amber-500 bg-amber-100 dark:bg-amber-500/10", icone: Briefcase, label: "Variável" },
};

export default function ParceirosPage() {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [parceiros, setParceiros] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estado para saber quem estamos editando (null = criando novo)
  const [parceiroEditando, setParceiroEditando] = useState<any>(null);

  const buscarParceiros = async () => {
    setCarregando(true);
    const { data, error } = await supabase.from("parceiros").select("*").order("criado_em", { ascending: false });
    if (data) setParceiros(data);
    if (error) toast.error("Erro ao carregar os dados.");
    setCarregando(false);
  };

  useEffect(() => {
    buscarParceiros();
  }, []);

  const abrirParaCriar = () => {
    setParceiroEditando(null);
    setDrawerAberto(true);
  };

  const abrirParaEditar = (parceiro: any) => {
    setParceiroEditando(parceiro);
    setDrawerAberto(true);
  };

  const excluirParceiro = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja remover ${nome} do sistema?`)) return;
    const toastId = toast.loading("Excluindo...");
    const { error } = await supabase.from("parceiros").delete().eq("id", id);
    if (error) {
      toast.error("Erro: Ele pode estar atrelado a algum contrato.", { id: toastId });
    } else {
      toast.success("Parceiro removido com sucesso.", { id: toastId });
      buscarParceiros();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <Users className="text-[#A67B5B]" size={32} />
            Ecossistema de Parceiros
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Mapeamento inteligente de vínculos e compromissos.
          </p>
        </div>
        <button onClick={abrirParaCriar} className="flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
          <Plus size={20} />
          <span>Novo Parceiro</span>
        </button>
      </div>

      {carregando ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-[#A67B5B]" size={40} />
        </div>
      ) : parceiros.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
          <Users size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
          <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400">Ecossistema vazio</h3>
          <p className="text-stone-400 text-sm mt-1">Clique acima para mapear sua rede.</p>
        </div>
      ) : (
        /* O Grid de Cards Inteligentes */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parceiros.map((parceiro) => {
            const config = relacaoConfig[parceiro.tipo] || { cor: "text-stone-500 bg-stone-100 dark:bg-stone-800", icone: Users, label: parceiro.tipo.toUpperCase() };
            const Icone = config.icone;

            return (
              <div key={parceiro.id} className="group relative p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-xl hover:border-[#A67B5B]/50 transition-all duration-300">
                
                {/* Cabeçalho do Card */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xl font-black text-[#A67B5B]">
                      {parceiro.nome.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100">{parceiro.nome}</h3>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${config.cor}`}>
                        <Icone size={12} />
                        {config.label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu de Ações Rápido (Aparece suavemente) */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => abrirParaEditar(parceiro)} className="p-2 text-stone-400 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => excluirParceiro(parceiro.id, parceiro.nome)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Dados de Contato e Resumo Inteligente */}
                <div className="space-y-3 mt-6 border-t border-stone-100 dark:border-stone-800 pt-4">
                  <p className="text-sm text-stone-600 dark:text-stone-400 flex justify-between">
                    <span>WhatsApp:</span> <span className="font-medium text-stone-900 dark:text-stone-100">{parceiro.telefone}</span>
                  </p>
                  <p className="text-sm text-stone-600 dark:text-stone-400 flex justify-between">
                    <span>Chave PIX:</span> <span className="font-medium text-stone-900 dark:text-stone-100 truncate max-w-[120px]">{parceiro.chave_pix || "N/A"}</span>
                  </p>
                </div>

                {/* Ação Pró-ativa (Visão de Futuro) */}
                <button className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 bg-stone-50 dark:bg-stone-950/50 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl text-sm font-semibold transition-colors border border-stone-200 dark:border-stone-800">
                  <Send size={14} /> Atribuir Contrato
                </button>

              </div>
            );
          })}
        </div>
      )}

      {/* Drawer unificado para Criar e Editar */}
      <DrawerParceiro 
        aberto={drawerAberto} 
        fechar={() => setDrawerAberto(false)} 
        parceiroEditando={parceiroEditando}
        aoSalvar={buscarParceiros}
      />
    </div>
  );
}