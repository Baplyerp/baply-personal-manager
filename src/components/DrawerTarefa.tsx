"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, ClipboardCheck, Calendar, Users, RotateCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DrawerTarefaProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
};

export default function DrawerTarefa({ aberto, fechar, aoSalvar }: DrawerTarefaProps) {
  const [salvando, setSalvando] = useState(false);
  const [moradores, setMoradores] = useState<any[]>([]);
  
  const [titulo, setTitulo] = useState("");
  const [frequencia, setFrequencia] = useState("7"); // Em dias
  const [responsavelId, setResponsavelId] = useState("");
  const [proximaExecucao, setProximaExecucao] = useState("");

  useEffect(() => {
    const buscarMoradores = async () => {
      const { data } = await supabase.from("moradores").select("*").order("criado_em", { ascending: true });
      if (data && data.length > 0) {
        setMoradores(data);
        setResponsavelId(data[0].id); // Seleciona o primeiro por padrão
      }
    };
    if (aberto) buscarMoradores();
  }, [aberto]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Configurando rodízio de tarefas...");

    try {
      const { error } = await supabase.from("operacoes_casa").insert([{
        titulo,
        frequencia, 
        responsavel_id: responsavelId,
        proxima_execucao: proximaExecucao,
        status_sla: 'no_prazo'
      }]);

      if (error) throw error;

      toast.success("Rotina configurada com sucesso! 🧹", { id: toastId });
      setTitulo(""); setProximaExecucao("");
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
      <div onClick={fechar} className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300" />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-200 dark:border-stone-800 z-50 animate-in slide-in-from-right duration-500 flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ClipboardCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">Nova Rotina</h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">SLA de Limpeza & Facilities</p>
            </div>
          </div>
          <button onClick={fechar} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="form-tarefa" onSubmit={handleSalvar} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><ClipboardCheck size={16} /> O que precisa ser feito?</label>
              <input required value={titulo} onChange={(e) => setTitulo(e.target.value)} type="text" placeholder="Ex: Faxina Geral, Tirar o Lixo..." className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><RotateCw size={16} /> Frequência</label>
                <select value={frequencia} onChange={(e) => setFrequencia(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm appearance-none">
                  <option value="1">Diário</option>
                  <option value="7">Semanal</option>
                  <option value="15">Quinzenal</option>
                  <option value="30">Mensal</option>
                </select>
              </div>
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><Calendar size={16} /> Primeiro Prazo</label>
                <input required value={proximaExecucao} onChange={(e) => setProximaExecucao(e.target.value)} type="date" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm" />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><Users size={16} /> Quem começa o rodízio?</label>
              <select required value={responsavelId} onChange={(e) => setResponsavelId(e.target.value)} className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-sm appearance-none">
                {moradores.map(m => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
              <p className="text-xs text-stone-500 mt-1">Após a conclusão, o sistema passará a tarefa para o próximo morador automaticamente.</p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20 flex gap-3">
          <button type="button" onClick={fechar} className="flex-1 py-3.5 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">Cancelar</button>
          <button type="submit" form="form-tarefa" disabled={salvando} className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2">
            {salvando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Criar Rotina</span>
          </button>
        </div>

      </div>
    </>
  );
}