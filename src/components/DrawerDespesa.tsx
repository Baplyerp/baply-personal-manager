"use client";

import { useState, useEffect } from "react";
import { X, ShoppingCart, DollarSign, Calendar, Tag, CreditCard, Layers, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type DrawerProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
};

export default function DrawerDespesa({ aberto, fechar, aoSalvar }: DrawerProps) {
  const [salvando, setSalvando] = useState(false);
  const [contas, setContas] = useState<any[]>([]);
  
  // Estados do Formulário
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataDespesa, setDataDespesa] = useState(new Date().toISOString().split('T')[0]);
  const [categoria, setCategoria] = useState("alimentacao");
  const [contaId, setContaId] = useState("");
  const [parcelas, setParcelas] = useState("1");

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
      buscarContas();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto]);

  const buscarContas = async () => {
    const { data } = await supabase.from("contas_cartoes").select("id, nome, tipo").eq("ativo", true);
    if (data) {
      setContas(data);
      if (data.length > 0 && !contaId) setContaId(data[0].id);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Lançando despesa...");

    try {
      const qtdParcelas = parseInt(parcelas);
      const valorTotal = parseFloat(valor.replace(",", "."));
      const valorParcela = valorTotal / qtdParcelas;
      
      const despesasParaInserir = [];

      // Mágica Baply: Cria os lançamentos para os meses futuros automaticamente!
      for (let i = 1; i <= qtdParcelas; i++) {
        const dataBase = new Date(dataDespesa);
        // Adiciona os meses para as próximas parcelas
        dataBase.setMonth(dataBase.getMonth() + (i - 1));
        
        despesasParaInserir.push({
          conta_id: contaId,
          descricao: qtdParcelas > 1 ? `${descricao} (${i}/${qtdParcelas})` : descricao,
          valor: valorParcela,
          data_despesa: dataBase.toISOString().split('T')[0],
          categoria,
          parcela_atual: i,
          total_parcelas: qtdParcelas,
          status: "pago" // Futuramente podemos colocar "pendente" para as do futuro
        });
      }

      const { error } = await supabase.from("despesas").insert(despesasParaInserir);
      if (error) throw error;

      toast.success(qtdParcelas > 1 ? "Compra parcelada lançada com sucesso! 🛍️" : "Despesa lançada! 🛒", { id: toastId });
      
      // Limpa formulário
      setDescricao(""); setValor(""); setParcelas("1");
      
      aoSalvar();
      fechar();
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <div onClick={fechar} className={`fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500 ${aberto ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-stone-950 border-l border-stone-200 dark:border-stone-800 shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${aberto ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Lançar Despesa</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Registre seus gastos do dia a dia.</p>
          </div>
          <button onClick={fechar} className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"><X size={24} /></button>
        </div>

        <form id="form-despesa" onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><ShoppingCart size={16} className="text-[#A67B5B]" /> O que você comprou?</label>
            <input required value={descricao} onChange={(e) => setDescricao(e.target.value)} type="text" placeholder="Ex: Supermercado Mateus, Uber..." className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><DollarSign size={16} className="text-[#A67B5B]" /> Valor Total (R$)</label>
              <input required value={valor} onChange={(e) => setValor(e.target.value)} type="number" step="0.01" placeholder="0.00" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono text-lg" />
            </div>
            
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Calendar size={16} className="text-[#A67B5B]" /> Data</label>
              <input required value={dataDespesa} onChange={(e) => setDataDespesa(e.target.value)} type="date" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Tag size={16} className="text-[#A67B5B]" /> Categoria</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all">
                <option value="alimentacao">🍔 Alimentação</option>
                <option value="transporte">🚗 Transporte</option>
                <option value="moradia">🏠 Moradia</option>
                <option value="saude">💊 Saúde/Farmácia</option>
                <option value="lazer">🎬 Lazer</option>
                <option value="compras">🛍️ Compras/Outros</option>
              </select>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Layers size={16} className="text-[#A67B5B]" /> Parcelas</label>
              <input required value={parcelas} onChange={(e) => setParcelas(e.target.value)} type="number" min="1" max="48" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><CreditCard size={16} className="text-[#A67B5B]" /> Forma de Pagamento</label>
            <select required value={contaId} onChange={(e) => setContaId(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all">
              {contas.length === 0 ? <option disabled>Cadastre um Cartão primeiro...</option> : null}
              {contas.map(c => <option key={c.id} value={c.id}>{c.nome} ({c.tipo.toUpperCase()})</option>)}
            </select>
          </div>

        </form>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/50">
          <button type="submit" form="form-despesa" disabled={salvando || contas.length === 0} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#A67B5B] to-[#8a6347] hover:from-[#966d50] hover:to-[#785438] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(166,123,91,0.3)] hover:shadow-[0_0_30px_rgba(166,123,91,0.5)] transition-all disabled:opacity-50 hover:-translate-y-1">
            {salvando ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span>{salvando ? "Processando..." : "Lançar Despesa"}</span>
          </button>
        </div>

      </div>
    </>
  );
}