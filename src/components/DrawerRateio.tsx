"use client";

import { useState, useEffect } from "react";
import { X, Split, Save, Loader2, DollarSign, Calendar, FileText, Users, CheckSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DrawerRateioProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
};

export default function DrawerRateio({ aberto, fechar, aoSalvar }: DrawerRateioProps) {
  const [salvando, setSalvando] = useState(false);
  const [moradores, setMoradores] = useState<any[]>([]);
  
  // Estados do Formulário
  const [titulo, setTitulo] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [moradoresSelecionados, setMoradoresSelecionados] = useState<string[]>([]);

  // Busca os moradores cadastrados no Supabase assim que o Drawer abre
  useEffect(() => {
    const buscarMoradores = async () => {
      const { data } = await supabase.from("moradores").select("*").order("criado_em", { ascending: true });
      if (data) {
        setMoradores(data);
        // Por padrão, seleciona todos para dividir a conta
        setMoradoresSelecionados(data.map(m => m.id));
      }
    };
    if (aberto) buscarMoradores();
  }, [aberto]);

  const toggleMorador = (id: string) => {
    setMoradoresSelecionados(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (moradoresSelecionados.length === 0) {
      return toast.error("Selecione pelo menos uma pessoa para dividir a conta!");
    }

    setSalvando(true);
    const toastId = toast.loading("Calculando rateio e gerando faturas...");

    try {
      const valorNumerico = parseFloat(valorTotal.replace(",", ".") || "0");
      
      // 1. Cria a Conta "Mãe"
      const { data: conta, error: erroConta } = await supabase
        .from("contas_compartilhadas")
        .insert([{
          titulo,
          valor_total: valorNumerico,
          data_vencimento: dataVencimento,
          pago: false
        }])
        .select()
        .single();

      if (erroConta) throw erroConta;

      // 2. Calcula a divisão matemática
      const valorPorPessoa = valorNumerico / moradoresSelecionados.length;

      // 3. Cria as "faturas" individuais para os selecionados
      const rateios = moradoresSelecionados.map(moradorId => ({
        conta_id: conta.id,
        morador_id: moradorId,
        valor_devido: valorPorPessoa,
        pago: false
      }));

      const { error: erroRateio } = await supabase.from("rateio_contas").insert(rateios);
      if (erroRateio) throw erroRateio;

      toast.success("Conta dividida com sucesso! 💸", { id: toastId });
      
      // Limpa formulário
      setTitulo("");
      setValorTotal("");
      setDataVencimento("");
      
      aoSalvar();
      fechar();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`, { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  // Preview ao vivo do valor dividido
  const valorDividido = parseFloat(valorTotal.replace(",", ".") || "0") / (moradoresSelecionados.length || 1);

  if (!aberto) return null;

  return (
    <>
      <div onClick={fechar} className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-200 dark:border-stone-800 z-50 animate-in slide-in-from-right duration-500 flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#A67B5B]/10 rounded-xl flex items-center justify-center text-[#A67B5B]">
              <Split size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">Nova Conta</h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Rateio Inteligente</p>
            </div>
          </div>
          <button onClick={fechar} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="form-rateio" onSubmit={handleSalvar} className="space-y-6">
            
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <FileText size={16} /> Descrição da Despesa
              </label>
              <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} type="text" placeholder="Ex: Conta de Energia" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <DollarSign size={16} /> Valor Total (R$)
                </label>
                <input required value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} type="number" step="0.01" placeholder="0,00" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono font-bold text-stone-800 dark:text-stone-100 text-lg shadow-sm" />
              </div>
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Calendar size={16} /> Vencimento
                </label>
                <input required value={dataVencimento} onChange={(e) => setDataVencimento(e.target.value)} type="date" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all text-sm shadow-sm" />
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-stone-800 w-full my-6"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Users size={16} /> Dividir entre quem?
                </label>
                {valorTotal && (
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg animate-in zoom-in duration-300">
                    R$ {valorDividido.toLocaleString('pt-BR', {minimumFractionDigits: 2})} / pessoa
                  </span>
                )}
              </div>
              
              <div className="space-y-2">
                {moradores.length === 0 ? (
                  <p className="text-xs text-stone-500 italic p-4 bg-stone-50 dark:bg-stone-900 rounded-xl">Nenhum morador cadastrado no banco de dados.</p>
                ) : (
                  moradores.map(morador => (
                    <div 
                      key={morador.id} 
                      onClick={() => toggleMorador(morador.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${moradoresSelecionados.includes(morador.id) ? 'border-[#A67B5B] bg-[#A67B5B]/5 dark:bg-[#A67B5B]/10' : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-5 h-5 rounded border ${moradoresSelecionados.includes(morador.id) ? 'bg-[#A67B5B] border-[#A67B5B] text-white' : 'border-stone-300 dark:border-stone-700'}`}>
                          {moradoresSelecionados.includes(morador.id) && <CheckSquare size={14} />}
                        </div>
                        <span className={`font-semibold text-sm ${moradoresSelecionados.includes(morador.id) ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}>
                          {morador.nome}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20 flex gap-3">
          <button type="button" onClick={fechar} className="flex-1 py-3.5 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">Cancelar</button>
          <button type="submit" form="form-rateio" disabled={salvando} className="flex-1 py-3.5 px-4 bg-[#A67B5B] hover:bg-[#8a6347] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
            {salvando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Dividir Conta</span>
          </button>
        </div>

      </div>
    </>
  );
}