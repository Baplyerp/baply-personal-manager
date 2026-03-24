"use client";

import { useState, useEffect } from "react";
import { Settings, User, Briefcase, Wallet, Target, Save, Loader2, ShieldCheck } from "lucide-react";
import { usePerfil } from "@/contexts/PerfilContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const { perfil, atualizarPerfil } = usePerfil();
  const [salvando, setSalvando] = useState(false);

  // Estados locais do formulário
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [renda, setRenda] = useState("");
  const [meta, setMeta] = useState("");

  // Quando o contexto carregar, preenchemos os inputs
  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || "");
      setCargo(perfil.cargo || "");
      setRenda(perfil.renda_mensal.toString() || "");
      setMeta("10000"); // Temporário até puxarmos do banco completo
    }
  }, [perfil]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Sincronizando dados globais...");

    try {
      // Atualiza a primeira linha da tabela perfil_global
      const { error } = await supabase
        .from("perfil_global")
        .update({
          nome,
          cargo,
          renda_mensal: parseFloat(renda.replace(",", ".")),
          // meta_reserva: parseFloat(meta) -> Adicionaremos depois
        })
        .eq("nome", perfil?.nome); // Em um app real, usaríamos o ID do usuário logado

      if (error) throw error;

      await atualizarPerfil(); // Força o sistema a ler os dados novos
      toast.success("Perfil atualizado com sucesso! Todo o sistema foi recalculado.", { id: toastId });
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`, { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-5xl mx-auto">
      
      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
          <Settings className="text-[#A67B5B]" size={32} />
          Configurações do Sistema
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mt-2">
          Gerencie suas variáveis globais e algoritmos de análise.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Esquerda: O Cartão de Perfil Visual */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-8 rounded-3xl bg-gradient-to-b from-[#A67B5B] to-[#785438] shadow-2xl text-white relative overflow-hidden group">
            {/* Efeito de Vidro e Círculos de Fundo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700" />
            
            <div className="relative z-10">
              <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black mb-6 shadow-inner border border-white/20">
                {nome ? nome.charAt(0).toUpperCase() : "B"}
              </div>
              <h3 className="text-2xl font-bold">{nome || "Carregando..."}</h3>
              <p className="text-stone-200 mt-1 font-medium">{cargo || "Defina seu cargo"}</p>
              
              <div className="mt-8 pt-6 border-t border-white/20 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-200">Renda Mensal (Base)</span>
                  <span className="font-bold">R$ {parseFloat(renda || "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-200">Status do Workspace</span>
                  <span className="flex items-center gap-1 text-emerald-300 font-bold bg-emerald-900/30 px-2 py-1 rounded-md">
                    <ShieldCheck size={14} /> Sincronizado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Os Formulários (O Motor) */}
        <div className="lg:col-span-2 space-y-6">
          <form id="form-perfil" onSubmit={handleSalvar} className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8">
            
            {/* Seção 1: Identidade */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2">Identidade Profissional</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2"><User size={16} /> Nome Principal</label>
                  <input required value={nome} onChange={(e) => setNome(e.target.value)} type="text" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2"><Briefcase size={16} /> Cargo Atual</label>
                  <input required value={cargo} onChange={(e) => setCargo(e.target.value)} type="text" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
              </div>
            </div>

            {/* Seção 2: Variáveis Financeiras */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2">Variáveis Base de Cálculo</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2"><Wallet size={16} /> Renda Mensal (R$)</label>
                  <input required value={renda} onChange={(e) => setRenda(e.target.value)} type="number" step="0.01" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500 dark:text-stone-400 flex items-center gap-2"><Target size={16} /> Meta de Reserva (R$)</label>
                  <input required value={meta} onChange={(e) => setMeta(e.target.value)} type="number" step="0.01" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono" />
                </div>
              </div>
            </div>

            {/* Botão Salvar Integrado */}
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={salvando} className="flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:-translate-y-0">
                {salvando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>{salvando ? "Processando..." : "Salvar Configurações"}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}