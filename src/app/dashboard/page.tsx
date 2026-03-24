import { ArrowUpRight, ArrowDownRight, DollarSign, Sparkles, BrainCircuit, Target } from "lucide-react";
import BotaoWhatsApp from "@/components/BotaoWhatsApp";

export default function DashboardPage() {
  // Simulação da lógica de IA que faremos no futuro
  const rendaMensal = 4500.00;
  const totalDividas = 1800.00; // Aluguel + Parcelas do mês
  const percentualComprometido = (totalDividas / rendaMensal) * 100;
  
  // Cores dinâmicas baseadas na saúde financeira
  const corStatus = percentualComprometido > 50 ? "text-red-500" : percentualComprometido > 30 ? "text-amber-500" : "text-emerald-500";
  const glowStatus = percentualComprometido > 50 ? "hover:shadow-red-500/20" : percentualComprometido > 30 ? "hover:shadow-amber-500/20" : "hover:shadow-emerald-500/20";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      
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

      {/* Grid Principal de Cards com Efeitos Exagerados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Renda e Orçamento (Efeito Emerald) */}
        <div className="group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] overflow-hidden cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Renda Base</h3>
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <div className="mt-6">
              <span className="text-4xl font-black text-stone-900 dark:text-stone-50">R$ 4.500</span>
              <p className="text-sm text-stone-400 mt-2 font-medium">Previsão de entrada no mês</p>
            </div>
          </div>
        </div>

        {/* Card 2: Comprometimento (Efeito Dinâmico Inteligente) */}
        <div className={`group relative p-6 rounded-3xl bg-white/50 dark:bg-stone-900/50 backdrop-blur-xl border border-stone-200 dark:border-stone-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(0,0,0,0.1)] ${glowStatus} overflow-hidden cursor-default`}>
          <div className="absolute inset-0 bg-gradient-to-br from-stone-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Comprometido</h3>
              <div className="h-12 w-12 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-400 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6">
                <ArrowDownRight size={24} />
              </div>
            </div>
            <div className="mt-6">
              <span className={`text-4xl font-black ${corStatus}`}>
                {percentualComprometido.toFixed(0)}%
              </span>
              <div className="w-full bg-stone-200 dark:bg-stone-800 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${percentualComprometido > 50 ? 'bg-red-500' : percentualComprometido > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                  style={{ width: `${percentualComprometido}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Próxima Ação (Efeito Ouro Baply) */}
        <div className="group relative p-6 rounded-3xl bg-gradient-to-br from-[#A67B5B] to-[#8a6347] border border-[#b88c6b] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_40px_rgba(166,123,91,0.4)] overflow-hidden cursor-pointer">
          {/* Efeito de brilho passando (Shimmer) */}
          <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-100">Próximo Vencimento</h3>
              <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                <Target size={24} />
              </div>
            </div>
            <div className="mt-6">
              <span className="text-4xl font-black text-white">R$ 450</span>
              <p className="text-sm text-stone-200 mt-2 font-medium flex justify-between">
                <span>Passagem (João)</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md">Amanhã</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Painel da IA - Reflexão Financeira */}
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
          <p className="text-stone-300 dark:text-stone-700 text-lg leading-relaxed">
            "Analisando sua renda de <strong className="text-white dark:text-stone-900">R$ 4.500</strong>, sua taxa de comprometimento atual é saudável ({percentualComprometido.toFixed(0)}%). No entanto, como você está em fase de mudança, recomendo criar uma reserva de segurança antes de antecipar o pagamento do credor João. Deseja que eu simule uma proposta de renegociação para o aluguel?"
          </p>
          <button className="mt-6 px-6 py-3 bg-white/10 dark:bg-stone-900/10 hover:bg-white/20 dark:hover:bg-stone-900/20 backdrop-blur-md rounded-xl text-stone-100 dark:text-stone-900 font-bold transition-all hover:scale-105 active:scale-95">
            Simular Cenários
          </button>
        </div>
      </div>

    </div>
  );
}