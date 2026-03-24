"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Loader2, Utensils, Car, Home, Pill, Popcorn, Package, Calendar } from "lucide-react";
import DrawerDespesa from "@/components/DrawerDespesa";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Mapeamento visual inteligente de categorias
const catConfig: any = {
  alimentacao: { icone: Utensils, cor: "text-orange-500 bg-orange-100 dark:bg-orange-500/10", label: "Alimentação" },
  transporte: { icone: Car, cor: "text-blue-500 bg-blue-100 dark:bg-blue-500/10", label: "Transporte" },
  moradia: { icone: Home, cor: "text-stone-500 bg-stone-100 dark:bg-stone-500/10", label: "Moradia" },
  saude: { icone: Pill, cor: "text-emerald-500 bg-emerald-100 dark:bg-emerald-500/10", label: "Saúde" },
  lazer: { icone: Popcorn, cor: "text-purple-500 bg-purple-100 dark:bg-purple-500/10", label: "Lazer" },
  compras: { icone: Package, cor: "text-rose-500 bg-rose-100 dark:bg-rose-500/10", label: "Compras" }
};

export default function DespesasPage() {
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [despesas, setDespesas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [totalMes, setTotalMes] = useState(0);

  const buscarDespesas = async () => {
    setCarregando(true);
    
    // Fazendo um JOIN para trazer os dados da conta que pagou
    const { data, error } = await supabase
      .from("despesas")
      .select(`
        *,
        contas_cartoes (nome, cor_tema, tipo)
      `)
      .order("data_despesa", { ascending: false })
      .limit(50); // Mostra as 50 mais recentes

    if (data) {
      setDespesas(data);
      // Calcula o total apenas do mês atual
      const mesAtual = new Date().getMonth();
      const somaMes = data
        .filter(d => new Date(d.data_despesa).getMonth() === mesAtual)
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);
      setTotalMes(somaMes);
    }
    if (error) toast.error("Erro ao carregar despesas.");
    setCarregando(false);
  };

  useEffect(() => {
    buscarDespesas();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
            <ShoppingCart className="text-[#A67B5B]" size={32} />
            Despesas Diárias
          </h2>
          <p className="text-stone-500 dark:text-stone-400 mt-2">
            Controle de fluxo de caixa, supermercado e transporte.
          </p>
        </div>
        <button 
          onClick={() => setDrawerAberto(true)} 
          className="flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <Plus size={20} />
          <span>Lançar Despesa</span>
        </button>
      </div>

      {/* Painel Resumo do Mês */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-stone-900 to-stone-800 text-white shadow-xl relative overflow-hidden flex items-center justify-between">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <p className="text-stone-400 font-semibold mb-1 uppercase tracking-wider text-sm">Total Gasto Neste Mês</p>
          <h3 className="text-4xl md:text-5xl font-black">R$ {totalMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
        </div>
        <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md relative z-10 hidden md:flex">
          <Calendar size={32} className="text-white opacity-80" />
        </div>
      </div>

      {/* Lista de Despesas */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        {carregando ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#A67B5B]" size={40} /></div>
        ) : despesas.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <ShoppingCart size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-400">Nenhum gasto registrado</h3>
            <p className="text-stone-400 text-sm mt-1">Sua carteira está intacta. Por enquanto!</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {despesas.map((despesa) => {
              const config = catConfig[despesa.categoria] || catConfig.compras;
              const Icone = config.icone;
              
              return (
                <div key={despesa.id} className="p-4 md:p-6 hover:bg-stone-50 dark:hover:bg-stone-950/50 transition-colors flex items-center justify-between group">
                  
                  {/* Bloco da Esquerda: Ícone e Descrição */}
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${config.cor} group-hover:scale-110 transition-transform`}>
                      <Icone size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100 text-lg">{despesa.descricao}</h4>
                      <div className="flex items-center gap-3 text-sm text-stone-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          {/* Bolinha com a cor do cartão/conta! */}
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: despesa.contas_cartoes?.cor_tema || '#A67B5B' }}></span>
                          {despesa.contas_cartoes?.nome || 'Não informada'}
                        </span>
                        <span>•</span>
                        <span>{new Date(despesa.data_despesa).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bloco da Direita: Valor e Parcela */}
                  <div className="text-right">
                    <p className="font-black text-xl text-stone-900 dark:text-stone-50">
                      R$ {parseFloat(despesa.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    {despesa.total_parcelas > 1 && (
                      <p className="text-xs font-bold text-stone-400 mt-1 uppercase tracking-wider">
                        Parc. {despesa.parcela_atual}/{despesa.total_parcelas}
                      </p>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <DrawerDespesa aberto={drawerAberto} fechar={() => setDrawerAberto(false)} aoSalvar={buscarDespesas} />
    </div>
  );
}