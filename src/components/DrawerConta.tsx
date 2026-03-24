"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, Wallet, Calendar, DollarSign, Save, Loader2, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type DrawerProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
};

export default function DrawerConta({ aberto, fechar, aoSalvar }: DrawerProps) {
  const [salvando, setSalvando] = useState(false);
  
  // Estados do Formulário
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("debito");
  const [limite, setLimite] = useState("");
  const [fechamento, setFechamento] = useState("1");
  const [vencimento, setVencimento] = useState("10");
  const [cor, setCor] = useState("#8b5cf6"); // Cor padrão bonita

  useEffect(() => {
    if (aberto) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Configurando carteira...");

    try {
      const { error } = await supabase.from("contas_cartoes").insert([{
        nome,
        tipo,
        limite_credito: tipo === 'credito' ? parseFloat(limite.replace(",", ".") || "0") : 0,
        dia_fechamento: tipo === 'credito' ? parseInt(fechamento) : null,
        dia_vencimento: tipo === 'credito' ? parseInt(vencimento) : null,
        cor_tema: cor
      }]);

      if (error) throw error;

      toast.success("Conta/Cartão adicionado com sucesso! 💳", { id: toastId });
      
      // Limpa formulário
      setNome(""); setTipo("debito"); setLimite(""); setFechamento("1"); setVencimento("10");
      
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
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Nova Fonte</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Contas, cartões e vales (VA/VR).</p>
          </div>
          <button onClick={fechar} className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"><X size={24} /></button>
        </div>

        <form id="form-conta" onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Wallet size={16} className="text-[#A67B5B]" /> Nome (Ex: Nubank, VR, Dinheiro)</label>
            <input required value={nome} onChange={(e) => setNome(e.target.value)} type="text" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><CreditCard size={16} className="text-[#A67B5B]" /> Modalidade</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all">
                <option value="debito">Conta / Débito</option>
                <option value="credito">Cartão de Crédito</option>
                <option value="vr">Vale Refeição (VR)</option>
                <option value="va">Vale Alimentação (VA)</option>
                <option value="carteira">Dinheiro Físico</option>
              </select>
            </div>
            
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Palette size={16} className="text-[#A67B5B]" /> Cor do Cartão</label>
              <input value={cor} onChange={(e) => setCor(e.target.value)} type="color" className="w-full h-[46px] p-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none cursor-pointer transition-all" />
            </div>
          </div>

          {/* Só mostra esses campos se for Cartão de Crédito */}
          {tipo === 'credito' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 pt-4 border-t border-stone-100 dark:border-stone-800">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><DollarSign size={16} className="text-[#A67B5B]" /> Limite Total (R$)</label>
                <input required value={limite} onChange={(e) => setLimite(e.target.value)} type="number" step="0.01" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Calendar size={16} className="text-[#A67B5B]" /> Dia Fechamento</label>
                  <input required value={fechamento} onChange={(e) => setFechamento(e.target.value)} type="number" min="1" max="31" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Calendar size={16} className="text-[#A67B5B]" /> Dia Vencimento</label>
                  <input required value={vencimento} onChange={(e) => setVencimento(e.target.value)} type="number" min="1" max="31" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/50">
          <button type="submit" form="form-conta" disabled={salvando} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#A67B5B] to-[#8a6347] hover:from-[#966d50] hover:to-[#785438] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(166,123,91,0.3)] hover:shadow-[0_0_30px_rgba(166,123,91,0.5)] transition-all disabled:opacity-50 hover:-translate-y-1">
            {salvando ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span>{salvando ? "Sincronizando..." : "Salvar Fonte"}</span>
          </button>
        </div>

      </div>
    </>
  );
}