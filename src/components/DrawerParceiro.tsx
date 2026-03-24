"use client";

import { useState, useEffect } from "react";
import { X, User, Phone, Hash, Tag, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Importação do nosso banco!

type DrawerProps = {
  aberto: boolean;
  fechar: () => void;
};

export default function DrawerParceiro({ aberto, fechar }: DrawerProps) {
  const [salvando, setSalvando] = useState(false);
  
  // Estados dos campos do formulário
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [tipo, setTipo] = useState("locador");

  useEffect(() => {
    if (aberto) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto]);

  const limparFormulario = () => {
    setNome(""); setTelefone(""); setChavePix(""); setTipo("locador");
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    
    // Mostrando o toast de carregamento
    const toastId = toast.loading("Salvando no Supabase...");

    try {
      // A Mágica: Inserindo na tabela 'parceiros' do Supabase
      const { error } = await supabase.from("parceiros").insert([
        { 
          nome, 
          telefone, 
          chave_pix: chavePix, 
          tipo 
        }
      ]);

      if (error) throw error;

      toast.success("Parceiro salvo com sucesso! 🚀", { id: toastId });
      limparFormulario();
      fechar();
      
      // Aqui, futuramente, chamaremos uma função para recarregar a lista na tela de trás!
      
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
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
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">Novo Parceiro</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Cadastre locadores, credores ou familiares.</p>
          </div>
          <button onClick={fechar} className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form id="form-parceiro" onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><User size={16} className="text-[#A67B5B]" /> Nome Completo</label>
            <input required value={nome} onChange={(e) => setNome(e.target.value)} type="text" placeholder="Ex: João Silva" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md" />
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Phone size={16} className="text-[#A67B5B]" /> WhatsApp</label>
            <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} type="tel" placeholder="(00) 90000-0000" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md" />
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Hash size={16} className="text-[#A67B5B]" /> Chave PIX</label>
            <input value={chavePix} onChange={(e) => setChavePix(e.target.value)} type="text" placeholder="CPF, E-mail ou Telefone" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md" />
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Tag size={16} className="text-[#A67B5B]" /> Categoria</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md appearance-none">
              <option value="credor">Credor (Empréstimo)</option>
              <option value="locador">Locador (Aluguel/Imóvel)</option>
              <option value="familiar">Familiar</option>
              <option value="servico">Prestador de Serviço</option>
            </select>
          </div>

        </form>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/50">
          <button type="submit" form="form-parceiro" disabled={salvando} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#A67B5B] to-[#8a6347] hover:from-[#966d50] hover:to-[#785438] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(166,123,91,0.3)] hover:shadow-[0_0_30px_rgba(166,123,91,0.5)] transition-all disabled:opacity-70 disabled:hover:shadow-none hover:-translate-y-1">
            {salvando ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span>{salvando ? "Sincronizando..." : "Salvar Parceiro"}</span>
          </button>
        </div>

      </div>
    </>
  );
}