"use client";

import { useState, useEffect } from "react";
import { Home, Plus, Loader2, ClipboardCheck, Split, Activity, Sparkles, Receipt, Calendar, CheckCircle2, Circle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import DrawerRateio from "@/components/DrawerRateio"; // 👈 Importamos o novo Drawer

export default function CasaPage() {
  const [carregando, setCarregando] = useState(true);
  const [contas, setContas] = useState<any[]>([]);
  const [drawerRateioAberto, setDrawerRateioAberto] = useState(false);

  // Estados Financeiros Inteligentes
  const eficiênciaSLA = 100; // SLA Mock por enquanto
  const [totalRateioPendente, setTotalRateioPendente] = useState(0);

  const buscarDados = async () => {
    setCarregando(true);
    
    // Busca as contas MÃE e, dentro delas, os RATEIOS (filhos) com o nome do MORADOR
    const { data: contasData, error } = await supabase
      .from("contas_compartilhadas")
      .select(`
        *,
        rateio_contas (
          id, valor_devido, pago,
          moradores ( nome )
        )
      `)
      .order("data_vencimento", { ascending: true });

    if (error) {
      toast.error("Erro ao carregar o Hub da Casa.");
    } else if (contasData) {
      setContas(contasData);
      
      // MÁQUINA DE CÁLCULO: Soma apenas as frações que estão pendentes (pago = false)
      let pendenteGeral = 0;
      contasData.forEach(conta => {
        conta.rateio_contas?.forEach((rateio: any) => {
          if (!rateio.pago) {
            pendenteGeral += Number(rateio.valor_devido);
          }
        });
      });
      setTotalRateioPendente(pendenteGeral);
    }
    
    setCarregando(false);
  };

  useEffect(() => {
    buscarDados();
  }, []);

  // Motor de Baixa Inteligente: Clica na pessoa, e o sistema dá como pago!
  const alternarPagamento = async (rateioId: string, statusAtual: boolean) => {
    const novoStatus = !statusAtual;
    
    // UI Optimistic Update (muda instantaneamente na tela antes do banco)
    setContas(contasAtuais => 
      contasAtuais.map(conta => ({
        ...conta,
        rateio_contas: conta.rateio_contas.map((r: any) => 
          r.id === rateioId ? { ...r, pago: novoStatus } : r
        )
      }))
    );
    
    // Atualiza o painel superior instantaneamente
    setTotalRateioPendente(prev => novoStatus ? prev - 0 /* Será recalculado no fetch */ : prev + 0);

    try {
      const { error } = await supabase.from("rateio_contas").update({ pago: novoStatus }).eq("id", rateioId);
      if (error) throw error;
      buscarDados(); // Recalcula tudo com precisão
    } catch (error: any) {
      toast.error("Erro ao atualizar status.");
      buscarDados(); // Reverte a tela caso dê erro
    }
  };

  return (
    <>
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
            <button onClick={() => setDrawerRateioAberto(true)} className="flex items-center gap-2 px-5 py-3 bg-[#A67B5B] hover:bg-[#8a6347] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
              <Plus size={20} />
              <span>Dividir Conta</span>
            </button>
          </div>
        </div>

        {/* 📈 Painéis de SLA e Rateio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <div className="p-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl border border-stone-800 shadow-lg flex flex-col justify-between md:col-span-2 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-[#A67B5B]/20 hover:-translate-y-1 transition-all duration-500 cursor-default">
            <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-700 ease-out">
              <Split size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-stone-400 group-hover:text-stone-300 transition-colors duration-300">Rateio Pendente a Receber</p>
              <div className="flex items-end gap-4 mt-2">
                <p className="text-3xl font-black text-white">
                  R$ {totalRateioPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                {totalRateioPendente === 0 && (
                  <p className="text-sm text-emerald-400 mb-1 font-bold flex items-center gap-1 bg-emerald-500/20 px-2.5 py-1 rounded-md">
                    <CheckCircle2 size={16} /> Tudo zerado!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de Gestão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Coluna 1: Tarefas (Esqueleto por enquanto) */}
          <div className="p-8 border border-stone-200 dark:border-stone-800 rounded-3xl flex flex-col items-center justify-center text-center bg-white dark:bg-stone-900 shadow-sm min-h-[300px]">
            <ClipboardCheck size={40} className="text-stone-300 dark:text-stone-700 mb-4" />
            <h3 className="font-bold text-lg text-stone-700 dark:text-stone-300">Escala de Tarefas</h3>
            <p className="text-sm text-stone-500 mt-2 max-w-sm">
              O algoritmo de rodízio de limpeza será implementado na próxima fase.
            </p>
          </div>

          {/* Coluna 2: A Máquina de Rateio em Ação */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Receipt className="text-[#A67B5B]" size={20} /> Contas Compartilhadas
              </h3>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto max-h-[600px] space-y-4">
              {carregando ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-[#A67B5B]" size={32} /></div>
              ) : contas.length === 0 ? (
                <div className="text-center py-12">
                  <Split size={32} className="mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                  <p className="text-sm font-medium text-stone-500">Nenhuma conta em aberto.</p>
                </div>
              ) : (
                contas.map(conta => (
                  <div key={conta.id} className="border border-stone-200 dark:border-stone-800 rounded-2xl p-5 hover:border-stone-300 dark:hover:border-stone-700 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white text-lg">{conta.titulo}</h4>
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 font-medium">
                          <Calendar size={12} /> Vence: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">Total</p>
                        <p className="font-black text-[#A67B5B] text-lg">R$ {conta.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                    
                    {/* As faturas individuais (A mágica do Rateio) */}
                    <div className="bg-stone-50 dark:bg-stone-950/50 rounded-xl p-3 space-y-2 border border-stone-100 dark:border-stone-900">
                      <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2 ml-1">Divisão Exata</p>
                      
                      {conta.rateio_contas?.map((rateio: any) => (
                        <div 
                          key={rateio.id} 
                          onClick={() => alternarPagamento(rateio.id, rateio.pago)}
                          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm border ${rateio.pago ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-[#A67B5B]/50'}`}
                        >
                          <div className="flex items-center gap-3">
                            {rateio.pago ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-stone-300 dark:text-stone-600" />}
                            <span className={`font-semibold text-sm ${rateio.pago ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70' : 'text-stone-700 dark:text-stone-200'}`}>
                              {rateio.moradores?.nome}
                            </span>
                          </div>
                          <span className={`font-black text-sm ${rateio.pago ? 'text-emerald-600/50 dark:text-emerald-400/50' : 'text-stone-800 dark:text-stone-100'}`}>
                            R$ {Number(rateio.valor_devido).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <DrawerRateio 
        aberto={drawerRateioAberto} 
        fechar={() => setDrawerRateioAberto(false)} 
        aoSalvar={buscarDados} 
      />
    </>
  );
}