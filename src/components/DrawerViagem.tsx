"use client";

import { useState, useEffect } from "react";
import { X, PlaneTakeoff, Calendar, Save, Loader2, Target, Map, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DrawerViagemProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
  viagemEditando?: any; // 👈 A inteligência de edição entra aqui
};

export default function DrawerViagem({ aberto, fechar, aoSalvar, viagemEditando }: DrawerViagemProps) {
  const [salvando, setSalvando] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [proposito, setProposito] = useState("mudanca");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  // 🧠 Inteligência: Preenche os dados se estiver no Modo Edição
  useEffect(() => {
    if (aberto && viagemEditando) {
      setTitulo(viagemEditando.titulo || "");
      setProposito(viagemEditando.proposito || "mudanca");
      // Trata a data para exibir corretamente no formato YYYY-MM-DD
      setDataInicio(viagemEditando.data_inicio ? viagemEditando.data_inicio.split("T")[0] : "");
      setDataFim(viagemEditando.data_fim ? viagemEditando.data_fim.split("T")[0] : "");
    } else if (aberto && !viagemEditando) {
      // Se for um novo roteiro, garante que o formulário está limpo
      setTitulo("");
      setProposito("mudanca");
      setDataInicio("");
      setDataFim("");
    }
  }, [aberto, viagemEditando]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading(viagemEditando ? "A atualizar projeto..." : "A mapear novo roteiro...");

    const dados = {
      titulo,
      proposito,
      data_inicio: dataInicio || null,
      data_fim: dataFim || null,
    };

    try {
      if (viagemEditando) {
        // MODO ATUALIZAÇÃO (UPDATE)
        const { error } = await supabase.from("viagens").update(dados).eq("id", viagemEditando.id);
        if (error) throw error;
        toast.success("Roteiro atualizado com sucesso! 🔄", { id: toastId });
      } else {
        // MODO CRIAÇÃO (INSERT)
        const { error } = await supabase.from("viagens").insert([{ ...dados, status: "planejamento" }]);
        if (error) throw error;
        toast.success("Roteiro mapeado com sucesso! ✈️", { id: toastId });
      }
      
      aoSalvar();
      fechar();
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`, { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto) return null;

  return (
    <>
      {/* Overlay escuro que desfoca o fundo */}
      <div 
        onClick={fechar} 
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
      />

      {/* O Painel Deslizante */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-200 dark:border-stone-800 z-50 animate-in slide-in-from-right duration-500 flex flex-col">
        
        {/* Cabeçalho do Drawer */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${viagemEditando ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-[#A67B5B]/10 text-[#A67B5B]'}`}>
              {viagemEditando ? <RefreshCw size={20} /> : <PlaneTakeoff size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">
                {viagemEditando ? "Editar Roteiro" : "Novo Roteiro"}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Módulo de Transição & Viagens</p>
            </div>
          </div>
          <button onClick={fechar} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="form-viagem" onSubmit={handleSalvar} className="space-y-6">
            
            {/* Título */}
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <Map size={16} /> Nome da Rota / Projeto
              </label>
              <input 
                required 
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
                type="text" 
                placeholder="Ex: Transição TGP Maranhão" 
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all placeholder:text-stone-400"
              />
            </div>

            {/* Propósito */}
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                <Target size={16} /> Propósito Estratégico
              </label>
              <select 
                value={proposito} 
                onChange={(e) => setProposito(e.target.value)} 
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all appearance-none cursor-pointer"
              >
                <option value="mudanca">📦 Mudança de Base / Transição</option>
                <option value="trabalho">💼 Trabalho / Institucional</option>
                <option value="estudo">🎓 Capacitação / Estudo</option>
                <option value="lazer">🌴 Férias / Lazer</option>
              </select>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Calendar size={16} /> Partida
                </label>
                <input 
                  required
                  value={dataInicio} 
                  onChange={(e) => setDataInicio(e.target.value)} 
                  type="date" 
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all text-sm"
                />
              </div>
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Calendar size={16} /> Retorno (Opcional)
                </label>
                <input 
                  value={dataFim} 
                  onChange={(e) => setDataFim(e.target.value)} 
                  type="date" 
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all text-sm"
                />
                <p className="text-[10px] text-stone-400 mt-1">Deixe em branco se for só ida.</p>
              </div>
            </div>

          </form>
        </div>

        {/* Rodapé (Ações) */}
        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20 flex gap-3">
          <button 
            type="button" 
            onClick={fechar} 
            className="flex-1 py-3.5 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="form-viagem" 
            disabled={salvando} 
            className={`flex-1 py-3.5 px-4 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 ${viagemEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#A67B5B] hover:bg-[#8a6347]'}`}
          >
            {salvando ? <Loader2 size={20} className="animate-spin" /> : (viagemEditando ? <RefreshCw size={20} /> : <Save size={20} />)}
            <span>{viagemEditando ? "Atualizar" : "Criar Projeto"}</span>
          </button>
        </div>

      </div>
    </>
  );
}