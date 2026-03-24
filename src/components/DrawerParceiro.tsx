"use client";

import { useState, useEffect } from "react";
import { X, User, Phone, Hash, Tag, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type DrawerProps = {
  aberto: boolean;
  fechar: () => void;
  parceiroEditando?: any; // Recebe o parceiro se for modo de edição
  aoSalvar: () => void; // Avisa a página para recarregar a lista
};

export default function DrawerParceiro({ aberto, fechar, parceiroEditando, aoSalvar }: DrawerProps) {
  const [salvando, setSalvando] = useState(false);
  
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [chavePix, setChavePix] = useState("");
  const [tipo, setTipo] = useState("locador");

  // Se o parceiroEditando mudar, preenchemos o formulário!
  useEffect(() => {
    if (parceiroEditando) {
      setNome(parceiroEditando.nome);
      setTelefone(parceiroEditando.telefone || "");
      setChavePix(parceiroEditando.chave_pix || "");
      setTipo(parceiroEditando.tipo);
    } else {
      setNome(""); setTelefone(""); setChavePix(""); setTipo("locador");
    }
  }, [parceiroEditando, aberto]);

  useEffect(() => {
    if (aberto) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading(parceiroEditando ? "Atualizando parceiro..." : "Salvando no Supabase...");

    try {
      if (parceiroEditando) {
        // MODO EDIÇÃO
        const { error } = await supabase
          .from("parceiros")
          .update({ nome, telefone, chave_pix: chavePix, tipo })
          .eq("id", parceiroEditando.id);
        if (error) throw error;
        toast.success("Parceiro atualizado com sucesso! ✨", { id: toastId });
      } else {
        // MODO CRIAÇÃO
        const { error } = await supabase
          .from("parceiros")
          .insert([{ nome, telefone, chave_pix: chavePix, tipo }]);
        if (error) throw error;
        toast.success("Parceiro salvo com sucesso! 🚀", { id: toastId });
      }

      aoSalvar(); // Pede para a página recarregar a lista
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
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50">
              {parceiroEditando ? "Editar Parceiro" : "Novo Parceiro"}
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Gerencie os dados e vínculos.</p>
          </div>
          <button onClick={fechar} className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form id="form-parceiro" onSubmit={handleSalvar} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><User size={16} className="text-[#A67B5B]" /> Nome Completo</label>
            <input required value={nome} onChange={(e) => setNome(e.target.value)} type="text" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md" />
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Phone size={16} className="text-[#A67B5B]" /> WhatsApp</label>
            <input required value={telefone} onChange={(e) => setTelefone(e.target.value)} type="tel" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md" />
          </div>

          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2"><Hash size={16} className="text-[#A67B5B]" /> Chave PIX</label>
            <input value={chavePix} onChange={(e) => setChavePix(e.target.value)} type="text" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md" />
          </div>

          {/* Campo: Natureza da Relação (Dinâmico) */}
          <div className="space-y-2 group">
            <label className="text-sm font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-2">
              <Tag size={16} className="text-[#A67B5B]" /> Natureza da Relação
            </label>
            
            {/* Lógica: Se for 'novo', mostra input de texto. Se não, mostra o Select */}
            {tipo === "novo" ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Ex: Sócio, Investidor..."
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all shadow-inner"
                  onChange={(e) => setTipo(e.target.value.toLowerCase())} // Salva em minúsculo para padronizar
                  onBlur={(e) => { if (!e.target.value) setTipo("credor") }} // Se sair sem digitar, volta ao padrão
                />
                <button 
                  type="button" 
                  onClick={() => setTipo("credor")}
                  className="px-4 bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-xl hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                  title="Cancelar"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)} 
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 focus:border-[#A67B5B] transition-all group-hover:shadow-md cursor-pointer"
              >
                <option value="credor">Credor (Risco/Dívida)</option>
                <option value="locador">Locador (Contrato Fixo)</option>
                <option value="familiar">Familiar (Flexível/Apoio)</option>
                <option value="servico">Serviço (Variável)</option>
                <option disabled>──────────</option>
                <option value="novo" className="font-bold text-[#A67B5B]">✨ Criar nova categoria...</option>
              </select>
            )}
          </div>
        </form>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-950/50">
          <button type="submit" form="form-parceiro" disabled={salvando} className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#A67B5B] to-[#8a6347] hover:from-[#966d50] hover:to-[#785438] text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(166,123,91,0.3)] hover:shadow-[0_0_30px_rgba(166,123,91,0.5)] transition-all hover:-translate-y-1">
            {salvando ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
            <span>{salvando ? "Sincronizando..." : "Salvar Parceiro"}</span>
          </button>
        </div>

      </div>
    </>
  );
}