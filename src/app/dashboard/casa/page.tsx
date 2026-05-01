"use client";

import { useState, useEffect } from "react";
import { Home, Plus, Loader2, ClipboardCheck, Split, Activity, Sparkles, Receipt, Calendar, CheckCircle2, Circle, Settings, MapPin, Wifi, Check, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import DrawerRateio from "@/components/DrawerRateio";
import DrawerCasaConfig from "@/components/DrawerCasaConfig";
import DrawerTarefa from "@/components/DrawerTarefa"; // 👈 Importamos o Criador de Tarefas

export default function CasaPage() {
  const [carregando, setCarregando] = useState(true);
  const [contas, setContas] = useState<any[]>([]);
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [moradores, setMoradores] = useState<any[]>([]);
  const [dadosCasa, setDadosCasa] = useState<any>(null);
  
  const [drawerRateioAberto, setDrawerRateioAberto] = useState(false);
  const [drawerConfigAberto, setDrawerConfigAberto] = useState(false);
  const [drawerTarefaAberto, setDrawerTarefaAberto] = useState(false);

  const [totalRateioPendente, setTotalRateioPendente] = useState(0);
  const [eficienciaSLA, setEficienciaSLA] = useState(100);

  const buscarDados = async () => {
    setCarregando(true);
    
    // 1. Casa e Moradores
    const { data: casa } = await supabase.from("configuracoes_casa").select("*").limit(1).single();
    if (casa) setDadosCasa(casa);

    const { data: moradoresData } = await supabase.from("moradores").select("*").order("criado_em", { ascending: true });
    if (moradoresData) setMoradores(moradoresData);

    // 2. Financeiro
    const { data: contasData } = await supabase.from("contas_compartilhadas").select(`*, rateio_contas ( id, valor_devido, pago, moradores ( nome ) )`).order("data_vencimento", { ascending: true });
    if (contasData) {
      setContas(contasData);
      let pendenteGeral = 0;
      contasData.forEach(conta => conta.rateio_contas?.forEach((rateio: any) => { if (!rateio.pago) pendenteGeral += Number(rateio.valor_devido); }));
      setTotalRateioPendente(pendenteGeral);
    }

    // 3. Operações (SLA e Rodízio)
    const { data: tarefasData } = await supabase.from("operacoes_casa").select(`*, moradores ( nome, username )`).order("proxima_execucao", { ascending: true });
    if (tarefasData) {
      setTarefas(tarefasData);
      
      // Motor de SLA Inteligente: Quantas tarefas estão no prazo?
      if (tarefasData.length > 0) {
        const hoje = new Date();
        hoje.setHours(0,0,0,0);
        const tarefasNoPrazo = tarefasData.filter(t => new Date(t.proxima_execucao) >= hoje).length;
        setEficienciaSLA(Math.round((tarefasNoPrazo / tarefasData.length) * 100));
      } else {
        setEficienciaSLA(100);
      }
    }
    
    setCarregando(false);
  };

  useEffect(() => { buscarDados(); }, []);

  const alternarPagamento = async (rateioId: string, statusAtual: boolean) => {
    const novoStatus = !statusAtual;
    setContas(contasAtuais => contasAtuais.map(conta => ({ ...conta, rateio_contas: conta.rateio_contas.map((r: any) => r.id === rateioId ? { ...r, pago: novoStatus } : r) })));
    setTotalRateioPendente(prev => novoStatus ? prev - 0 : prev + 0);
    try {
      await supabase.from("rateio_contas").update({ pago: novoStatus }).eq("id", rateioId);
      buscarDados();
    } catch (error) { toast.error("Erro ao atualizar status."); buscarDados(); }
  };

  // 🧠 O Algoritmo de Conclusão e Passagem de Bastão (Rodízio)
  const concluirTarefa = async (tarefa: any) => {
    const toastId = toast.loading("Registrando conclusão e girando rodízio...");
    
    try {
      // 1. Acha o próximo morador da fila
      const indexAtual = moradores.findIndex(m => m.id === tarefa.responsavel_id);
      const proximoIndex = (indexAtual + 1) % moradores.length;
      const proximoMorador = moradores[proximoIndex];

      // 2. Calcula a nova data com base na frequência
      const novaData = new Date(tarefa.proxima_execucao);
      novaData.setDate(novaData.getDate() + parseInt(tarefa.frequencia));

      // 3. Atualiza no Banco
      const { error } = await supabase.from("operacoes_casa").update({
        responsavel_id: proximoMorador.id,
        proxima_execucao: novaData.toISOString(),
        ultima_execucao: new Date().toISOString()
      }).eq("id", tarefa.id);

      if (error) throw error;

      toast.success(`Concluído! A próxima vez é do(a) ${proximoMorador.nome} 🏆`, { id: toastId });
      buscarDados();
    } catch (error: any) {
      toast.error(`Erro ao concluir: ${error.message}`, { id: toastId });
    }
  };

  // Verifica se uma data já passou
  const estaAtrasado = (dataISO: string) => {
    const data = new Date(dataISO);
    const hoje = new Date();
    data.setHours(0,0,0,0); hoje.setHours(0,0,0,0);
    return data < hoje;
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
              <Home className="text-[#A67B5B]" size={32} />
              {dadosCasa?.nome || "Hub de Convivência"}
            </h2>
            {dadosCasa?.endereco && <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-1.5"><MapPin size={14} className="text-[#A67B5B]" /> {dadosCasa.endereco}</p>}
            {dadosCasa?.wifi_ssid && <p className="text-xs font-mono text-stone-400 mt-1 flex items-center gap-1.5 bg-stone-100 dark:bg-stone-800/50 inline-flex px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700"><Wifi size={12} /> Wi-Fi: <strong className="text-stone-600 dark:text-stone-300">{dadosCasa.wifi_ssid}</strong></p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setDrawerConfigAberto(true)} className="flex items-center justify-center p-3.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 rounded-xl transition-colors" title="Configurar Casa"><Settings size={20} /></button>
            <button onClick={() => setDrawerTarefaAberto(true)} className="flex items-center gap-2 px-5 py-3 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold transition-all"><ClipboardCheck size={20} /><span className="hidden sm:inline">Nova Tarefa</span></button>
            <button onClick={() => setDrawerRateioAberto(true)} className="flex items-center gap-2 px-5 py-3 bg-[#A67B5B] hover:bg-[#8a6347] text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"><Plus size={20} /><span>Dividir Conta</span></button>
          </div>
        </div>

        {/* 📈 Painéis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-default">
            <p className="text-sm font-semibold text-stone-500 flex items-center gap-2"><Activity size={16} className={eficienciaSLA >= 80 ? "text-emerald-500" : "text-rose-500"} /> Eficiência Operacional (SLA)</p>
            <div className="mt-2 flex items-end gap-2">
              <p className="text-3xl font-black text-stone-800 dark:text-stone-100">{eficienciaSLA}%</p>
              {eficienciaSLA === 100 ? (
                <p className="text-sm font-medium text-emerald-500 mb-1 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md"><Sparkles size={12}/> Impecável</p>
              ) : (
                <p className="text-sm font-medium text-rose-500 mb-1 flex items-center gap-1 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md"><AlertCircle size={12}/> Atenção aos prazos</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl border border-stone-800 shadow-lg flex flex-col justify-between md:col-span-2 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-[#A67B5B]/20 hover:-translate-y-1 transition-all duration-500 cursor-default">
            <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-700 ease-out"><Split size={120} /></div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-stone-400 group-hover:text-stone-300 transition-colors duration-300">Rateio Pendente a Receber</p>
              <div className="flex items-end gap-4 mt-2">
                <p className="text-3xl font-black text-white">R$ {totalRateioPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                {totalRateioPendente === 0 && <p className="text-sm text-emerald-400 mb-1 font-bold flex items-center gap-1 bg-emerald-500/20 px-2.5 py-1 rounded-md"><CheckCircle2 size={16} /> Tudo zerado!</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Áreas de Gestão */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Coluna 1: A Máquina de Rodízio de Tarefas */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/50">
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <ClipboardCheck className="text-emerald-500" size={20} /> Escala de Tarefas
              </h3>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto max-h-[600px] space-y-4 bg-stone-50/30 dark:bg-stone-950/20">
              {carregando ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>
              ) : tarefas.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardCheck size={32} className="mx-auto text-stone-300 dark:text-stone-700 mb-3" />
                  <p className="text-sm font-medium text-stone-500">Nenhuma rotina configurada.</p>
                </div>
              ) : (
                tarefas.map(tarefa => {
                  const atrasado = estaAtrasado(tarefa.proxima_execucao);
                  return (
                    <div key={tarefa.id} className={`border rounded-2xl p-5 transition-all shadow-sm group hover:-translate-y-1 ${atrasado ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:shadow-emerald-500/5'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-stone-900 dark:text-white text-lg">{tarefa.titulo}</h4>
                          <p className={`text-xs flex items-center gap-1 mt-1 font-bold ${atrasado ? 'text-rose-500' : 'text-stone-500'}`}>
                            {atrasado ? <AlertCircle size={14} /> : <Calendar size={14} />} 
                            {atrasado ? "Atrasado!" : `Prazo: ${new Date(tarefa.proxima_execucao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md">
                          {tarefa.frequencia === '1' ? 'Diário' : tarefa.frequencia === '7' ? 'Semanal' : tarefa.frequencia === '15' ? 'Quinzenal' : 'Mensal'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-800 border-2 border-white dark:border-stone-950 flex items-center justify-center text-stone-600 dark:text-stone-300 font-bold text-sm shadow-sm relative">
                            {tarefa.moradores?.nome?.substring(0,2).toUpperCase()}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-stone-900"></div>
                          </div>
                          <div>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">Vez de</p>
                            <p className="font-bold text-sm text-stone-800 dark:text-stone-100">{tarefa.moradores?.nome}</p>
                          </div>
                        </div>
                        
                        <button onClick={() => concluirTarefa(tarefa)} className="flex items-center gap-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-colors group-hover:shadow-lg">
                          <Check size={16} /> Concluir
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
                        <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 font-medium"><Calendar size={12} /> Vence: {new Date(conta.data_vencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mb-0.5">Total</p>
                        <p className="font-black text-[#A67B5B] text-lg">R$ {conta.valor_total.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>
                    
                    <div className="bg-stone-50 dark:bg-stone-950/50 rounded-xl p-3 space-y-2 border border-stone-100 dark:border-stone-900">
                      <p className="text-[10px] font-black uppercase text-stone-400 tracking-wider mb-2 ml-1">Divisão Exata</p>
                      {conta.rateio_contas?.map((rateio: any) => (
                        <div key={rateio.id} onClick={() => alternarPagamento(rateio.id, rateio.pago)} className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm border ${rateio.pago ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30' : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 hover:border-[#A67B5B]/50'}`}>
                          <div className="flex items-center gap-3">
                            {rateio.pago ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-stone-300 dark:text-stone-600" />}
                            <span className={`font-semibold text-sm ${rateio.pago ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70' : 'text-stone-700 dark:text-stone-200'}`}>{rateio.moradores?.nome}</span>
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

      <DrawerRateio aberto={drawerRateioAberto} fechar={() => setDrawerRateioAberto(false)} aoSalvar={buscarDados} />
      <DrawerCasaConfig aberto={drawerConfigAberto} fechar={() => setDrawerConfigAberto(false)} aoSalvar={buscarDados} />
      <DrawerTarefa aberto={drawerTarefaAberto} fechar={() => setDrawerTarefaAberto(false)} aoSalvar={buscarDados} />
    </>
  );
}