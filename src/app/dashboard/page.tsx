"use client";

import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight, Sparkles, BrainCircuit, Target, Loader2, X, Info, CreditCard, Repeat, TrendingUp, Plane } from "lucide-react";
import BotaoWhatsApp from "@/components/BotaoWhatsApp";
import { supabase } from "@/lib/supabase";
import { usePerfil } from "@/contexts/PerfilContext";

export default function DashboardPage() {
  const { perfil, carregando: carregandoPerfil } = usePerfil();
  const [carregandoDados, setCarregandoDados] = useState(true);
  
  const [listaContratos, setListaContratos] = useState<any[]>([]);
  const [totalComprometidoMes, setTotalComprometidoMes] = useState(0);
  const [proximoVencimento, setProximoVencimento] = useState<any>(null);

  const [modalAberto, setModalAberto] = useState<"comprometido" | "vencimentos" | null>(null);

  // Estados Simulados para os Novos Módulos (Serão conectados ao DB no futuro)
  const faturasCartao = 1250.00;
  const totalAssinaturas = 189.90;
  const metaReserva = 10000;
  const reservaAtual = 3500;
  const progressoReserva = (reservaAtual / metaReserva) * 100;

  useEffect(() => {
    const buscarDadosGlobais = async () => {
      setCarregandoDados(true);
      try {
        const { data: contratos } = await supabase.from("contratos").select("*, parceiros(nome)").eq("status", "ativo");

        if (contratos && contratos.length > 0) {
          let somaParcelas = 0;
          const hoje = new Date();
          const diaAtual = hoje.getDate(); 

          const filaOrdenada = contratos.map(contrato => {
            const qtd = contrato.quantidade_parcelas || 1;
            const valorBase = Math.floor((contrato.valor_total / qtd) * 100) / 100;
            
            somaParcelas += valorBase;

            const diaVenc = contrato.dia_vencimento;
            const distancia = diaVenc >= diaAtual ? (diaVenc - diaAtual) : ((30 - diaAtual) + diaVenc);
            
            return { ...contrato, diasFaltantes: distancia, valorParcela: valorBase };
          });

          filaOrdenada.sort((a, b) => a.diasFaltantes - b.diasFaltantes);

          setListaContratos(filaOrdenada);
          setTotalComprometidoMes(somaParcelas);
          setProximoVencimento(filaOrdenada[0]);
        } else {
          setListaContratos([]);
          setTotalComprometidoMes(0);
          setProximoVencimento(null);
        }
      } catch (error) {
        console.error("Erro ao puxar visão global", error);
      } finally {
        setCarregandoDados(false);
      }
    };

    buscarDadosGlobais();
  }, []);

  const rendaMensal = perfil?.renda_mensal || 0;
  const percentualComprometido = rendaMensal > 0 ? (totalComprometidoMes / rendaMensal) * 100 : 0;
  
  const corStatus = percentualComprometido > 50 ? "text-red-500" : percentualComprometido > 30 ? "text-amber-500" : "text-emerald-500";
  const glowStatus = percentualComprometido > 50 ? "hover:shadow-red-500/20" : percentualComprometido > 30 ? "hover:shadow-amber-500/20" : "hover:shadow-emerald-500/20";
  const corBarra = percentualComprometido > 50 ? "bg-red-500" : percentualComprometido > 30 ? "bg-amber-500" : "bg-emerald-500";
  
  const saudeTexto = percentualComprometido > 50 ? "em nível de alerta" : percentualComprometido > 30 ? "saudável" : "excelente";

  if (carregandoPerfil || carregandoDados) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-[#A67B5B]" size={40} /></div>;
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 relative">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-stone-900 to-stone-500 dark:from-stone-50 dark:to-stone-400">
              Inteligência Financeira
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2 flex items-center gap-2">
              <Sparkles size={16} className="text-[#A67B5B] animate-pulse" />
              Seu assistente pessoal de transição.
            </p>
          </div>
          <div><BotaoWhatsApp /></div>
        </div>

        {/* 🌟 LINHA 1: Visão Orçamentária Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Renda Base</h3>
                <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"><ArrowUpRight size={24} /></div>
              </div>
              <div className="mt-6">
                <span className="text-4xl font-black text-stone-900 dark:text-stone-50">R$ {rendaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <p className="text-sm text-stone-400 mt-2 font-medium">Previsão de entrada no mês</p>
              </div>
            </div>
          </div>

          <div onClick={() => setModalAberto("comprometido")} className={`group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] ${glowStatus} overflow-hidden cursor-pointer`}>
            <div className="absolute inset-0 bg-gradient-to-br from-stone-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Acordos & Contratos</h3>
                <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6"><ArrowDownRight size={24} /></div>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <span className={`text-4xl font-black ${corStatus}`}>{percentualComprometido.toFixed(0)}%</span>
                  <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-wider">Comprometido</p>
                </div>
                <Info size={16} className="text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 mt-3 overflow-hidden"><div className={`h-2 rounded-full transition-all duration-1000 ${corBarra}`} style={{ width: `${Math.min(percentualComprometido, 100)}%` }}></div></div>
            </div>
          </div>

          <div onClick={() => setModalAberto("vencimentos")} className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#A67B5B] to-[#8a6347] border border-[#b88c6b] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(166,123,91,0.4)] overflow-hidden cursor-pointer">
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100">Próximo Vencimento</h3>
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"><Target size={24} /></div>
              </div>
              <div className="mt-6 relative">
                {proximoVencimento ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">R$ {proximoVencimento.valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      {proximoVencimento.quantidade_parcelas > 1 && (
                        <span className="text-xs text-white/70 font-medium pb-1">/ R$ {proximoVencimento.valor_total.toLocaleString('pt-BR', {minimumFractionDigits:0})} total</span>
                      )}
                    </div>
                    <p className="text-sm text-stone-200 mt-2 font-medium flex justify-between items-center">
                      <span className="truncate pr-2">{proximoVencimento.titulo} ({proximoVencimento.parceiros?.nome})</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-md shrink-0">{proximoVencimento.diasFaltantes === 0 ? "É Hoje!" : proximoVencimento.diasFaltantes === 1 ? "Amanhã" : `Em ${proximoVencimento.diasFaltantes} dias`}</span>
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black text-white">Tudo Limpo!</span>
                    <p className="text-sm text-stone-200 mt-2 font-medium">Nenhum contrato ativo pendente.</p>
                  </>
                )}
                <Info size={16} className="text-white/50 absolute top-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 LINHA 2: Os Novos Módulos do Ecossistema */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <CreditCard size={18} className="group-hover:text-indigo-500 transition-colors"/> 
                <h3 className="text-sm font-bold uppercase tracking-wider">Cartões & Faturas</h3>
              </div>
            </div>
            <span className="text-2xl font-black text-stone-800 dark:text-stone-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              R$ {faturasCartao.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
            <p className="text-xs text-stone-400 mt-1 font-medium">Faturas abertas neste mês</p>
          </div>

          <div className="group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-1 hover:border-rose-300 dark:hover:border-rose-700 cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <Repeat size={18} className="group-hover:text-rose-500 transition-colors"/> 
                <h3 className="text-sm font-bold uppercase tracking-wider">Assinaturas</h3>
              </div>
            </div>
            <span className="text-2xl font-black text-stone-800 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              R$ {totalAssinaturas.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </span>
            <p className="text-xs text-stone-400 mt-1 font-medium">Netflix, Spotify, Internet...</p>
          </div>

          <div className="group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-default">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
                <TrendingUp size={18} className="group-hover:text-emerald-500 transition-colors"/> 
                <h3 className="text-sm font-bold uppercase tracking-wider">Patrimônio & Metas</h3>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md">{progressoReserva.toFixed(0)}%</span>
            </div>
            <span className="text-2xl font-black text-stone-800 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              R$ {reservaAtual.toLocaleString('pt-BR')} <span className="text-sm text-stone-400">/ {metaReserva.toLocaleString('pt-BR')}</span>
            </span>
            <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progressoReserva}%` }}></div>
            </div>
          </div>

        </div>

        {/* 🧠 Painel da IA - A Alma do Sistema Restaurada */}
        <div className="relative p-8 rounded-3xl bg-stone-900 dark:bg-stone-100 border border-stone-800 dark:border-stone-200 overflow-hidden group hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-700">
          <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12">
            <BrainCircuit size={120} className="text-white dark:text-stone-900" />
          </div>
          
          <div className="relative z-10 md:w-2/3">
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A67B5B] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#A67B5B]"></span>
              </span>
              <h3 className="text-lg font-bold text-stone-100 dark:text-stone-900 uppercase tracking-widest">
                Análise Pessoal Ativa
              </h3>
            </div>
            
            {/* O TEXTO RICO E NARRATIVO */}
            <p className="text-stone-300 dark:text-stone-700 text-lg leading-relaxed">
              "Analisando sua renda de <strong className="text-white dark:text-stone-900">R$ {rendaMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>, sua taxa de comprometimento atual é {saudeTexto} ({percentualComprometido.toFixed(0)}%). No entanto, como você está em fase de mudança, recomendo criar uma reserva de segurança forte antes de antecipar o pagamento de {proximoVencimento ? `credor(a) ${proximoVencimento.parceiros?.nome}` : 'seus credores'}. Deseja que eu simule uma proposta de renegociação para o seu aluguel ou dívidas?"
            </p>
            
            <button className="mt-6 px-6 py-3 bg-white/10 dark:bg-stone-900/10 hover:bg-white/20 dark:hover:bg-stone-900/20 backdrop-blur-md rounded-xl text-stone-100 dark:text-stone-900 font-bold transition-all hover:scale-105 active:scale-95">
              Simular Cenários
            </button>
          </div>
        </div>

      </div>

      {/* 🔮 O RAIO-X (Modais Explicativos Glassmorphism) */}
      {modalAberto && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setModalAberto(null)} className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300" />
          
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6 animate-in zoom-in-95 duration-300">
            <button onClick={() => setModalAberto(null)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"><X size={20}/></button>
            
            <h3 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2 mb-2">
              {modalAberto === "vencimentos" ? <Target className="text-[#A67B5B]"/> : <ArrowDownRight className="text-stone-500" />} 
              {modalAberto === "vencimentos" ? "Fila de Vencimentos" : "Raio-X do Orçamento"}
            </h3>
            
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-6">
              {modalAberto === "vencimentos" ? "Entenda a ordem das contas que vão vencer nos próximos dias." : "Veja exatamente quais contratos estão consumindo a sua renda mensal."}
            </p>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {listaContratos.length === 0 ? (
                <p className="text-center text-stone-400 py-4">Nenhum dado para mostrar.</p>
              ) : (
                listaContratos.map((c, index) => (
                  <div key={c.id} className="flex justify-between items-center p-4 rounded-2xl bg-stone-50 dark:bg-stone-950/50 border border-stone-100 dark:border-stone-800">
                    <div className="flex gap-4 items-center">
                      <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 font-black text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800 dark:text-stone-100 text-sm truncate max-w-[150px]">{c.titulo}</p>
                        <p className="text-xs text-stone-500">Todo dia {c.dia_vencimento} • {c.quantidade_parcelas}x parcelas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#A67B5B]">R$ {c.valorParcela.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      <p className="text-[10px] uppercase font-bold text-stone-400 mt-0.5">{c.diasFaltantes} dias restantes</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {modalAberto === "comprometido" && (
              <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                <span className="text-sm font-bold text-stone-500">Soma Total das Parcelas / Mês</span>
                <span className="text-xl font-black text-stone-900 dark:text-white">R$ {totalComprometidoMes.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}