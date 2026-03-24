"use client";

import { useState, useEffect } from "react";
import { X, FileSignature, DollarSign, Calendar, AlignLeft, User, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type DrawerProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
};

export default function DrawerContrato({ aberto, fechar, aoSalvar }: DrawerProps) {
  const [salvando, setSalvando] = useState(false);
  const [parceiros, setParceiros] = useState<any[]>([]);
  
  // Estados do Formulário
  const [parceiroId, setParceiroId] = useState("");
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [parcelas, setParcelas] = useState("1");
  const [diaVencimento, setDiaVencimento] = useState("10");

  useEffect(() => {
    if (aberto) {
      document.body.style.overflow = "hidden";
      buscarParceiros();
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto]);

  // Busca quem está cadastrado no CRM para podermos atrelar o contrato
  const buscarParceiros = async () => {
    const { data } = await supabase.from("parceiros").select("id, nome").order("nome");
    if (data) {
      setParceiros(data);
      if (data.length > 0 && !parceiroId) setParceiroId(data[0].id);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Registrando contrato...");

    try {
      const { error } = await supabase.from("contratos").insert([{
        parceiro_id: parceiroId,
        titulo,
        descricao,
        valor_total: parseFloat(valorTotal.replace(",", ".")),
        quantidade_parcelas: parseInt(parcelas),
        dia_vencimento: parseInt(diaVencimento),
        status: "ativo"
      }]);

      if (error) throw error;

      toast.success("Contrato/Acordo firmado com sucesso! 🤝", { id: toastId });
      
      // Limpa formulário
      setTitulo(""); setDescricao(""); setValorTotal(""); setParcelas("1"); setDiaVencimento("10");
      
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
      <div onClick={fechar} className={`fixed inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-500 ${aberto ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-stone-950 border-l border-stone-200 dark:border-stone-800 shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${aberto ? "translate-x-0" : "translate-x-full"}`}>
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Novo Acordo</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Registre dívidas, aluguéis ou contratos.</p>
          </div>
          <button onClick={fechar} className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"><X size={24} /></button>
        </div>

        <form id="form-contrato" onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><User size={16} className="text-[#A67B5B]" /> Parceiro Vinculado</label>
            <select required value={parceiroId} onChange={(e) => setParceiroId(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all">
              {parceiros.length === 0 ? <option disabled>Cadastre um parceiro primeiro...</option> : null}
              {parceiros.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </select>
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><FileSignature size={16} className="text-[#A67B5B]" /> Título do Acordo</label>
            <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} type="text" placeholder="Ex: Empréstimo Passagem MA" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><DollarSign size={16} className="text-[#A67B5B]" /> Valor Total (R$)</label>
            <input required value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} type="number" step="0.01" placeholder="Ex: 1500.00" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono text-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><AlignLeft size={16} className="text-[#A67B5B]" /> Qtd. Parcelas</label>
              <input required value={parcelas} onChange={(e) => setParcelas(e.target.value)} type="number" min="1" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
            </div>
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Calendar size={16} className="text-[#A67B5B]" /> Dia Vencimento</label>
              <input required value={diaVencimento} onChange={(e) => setDiaVencimento(e.target.value)} type="number" min="1" max="31" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
            </div>
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><AlignLeft size={16} className="text-[#A67B5B]" /> Descrição Rápida</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} placeholder="Motivo ou detalhes do acordo..." className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all resize-none" />
          </div>

        </form>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/50">
          <button type="submit" form="form-parceiro" disabled={salvando || parceiros.length === 0} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#A67B5B] to-[#8a6347] hover:from-[#966d50] hover:to-[#785438] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(166,123,91,0.3)] hover:shadow-[0_0_30px_rgba(166,123,91,0.5)] transition-all disabled:opacity-50 hover:-translate-y-1">
            {salvando ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span>{salvando ? "Sincronizando..." : "Firmar Acordo"}</span>
          </button>
        </div>

      </div>
    </>
  );
}