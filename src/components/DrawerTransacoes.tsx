"use client";

import { useState, useEffect } from "react";
import { X, Receipt, DollarSign, Calendar, Send, CheckCircle2, Loader2, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

type DrawerProps = {
  aberto: boolean;
  fechar: () => void;
  contrato: any; // Recebe o contrato selecionado e os dados do parceiro
};

export default function DrawerTransacoes({ aberto, fechar, contrato }: DrawerProps) {
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [enviandoWhats, setEnviandoWhats] = useState<string | null>(null);

  // Estados do formulário de nova baixa
  const [mostrarForm, setMostrarForm] = useState(false);
  const [valorPago, setValorPago] = useState("");
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().split('T')[0]);
  const [linkComprovante, setLinkComprovante] = useState(""); // Futuramente, faremos upload de arquivo aqui!

  useEffect(() => {
    if (aberto && contrato) {
      document.body.style.overflow = "hidden";
      buscarTransacoes();
      // Sugere o valor da parcela automaticamente
      setValorPago((contrato.valor_total / contrato.quantidade_parcelas).toFixed(2));
    } else {
      document.body.style.overflow = "unset";
      setMostrarForm(false);
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [aberto, contrato]);

  const buscarTransacoes = async () => {
    setCarregando(true);
    const { data } = await supabase
      .from("transacoes")
      .select("*")
      .eq("contrato_id", contrato.id)
      .order("data_pagamento", { ascending: false });
    
    if (data) setTransacoes(data);
    setCarregando(false);
  };

  const registrarPagamento = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Registrando pagamento...");

    try {
      const { error } = await supabase.from("transacoes").insert([{
        contrato_id: contrato.id,
        valor_pago: parseFloat(valorPago),
        data_pagamento: dataPagamento,
        comprovante_url: linkComprovante || "https://baply.com/recibo-padrao", // Mock se vazio
        status_whatsapp: "nao_enviado"
      }]);

      if (error) throw error;

      toast.success("Pagamento registrado com sucesso! 💸", { id: toastId });
      setMostrarForm(false);
      setLinkComprovante("");
      buscarTransacoes(); // Recarrega a lista
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`, { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  const dispararWhatsApp = async (transacao: any) => {
    setEnviandoWhats(transacao.id);
    const toastId = toast.loading("Enviando comprovante para o parceiro...");

    try {
      // Chama a nossa API interna que criamos anteriormente
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: contrato.parceiros.telefone,
          nome: contrato.parceiros.nome,
          valor: transacao.valor_pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
          descricao: contrato.titulo,
          linkComprovante: transacao.comprovante_url
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Atualiza o status no banco para 'enviado'
        await supabase.from("transacoes").update({ status_whatsapp: "enviado" }).eq("id", transacao.id);
        toast.success("Comprovante enviado para o WhatsApp! 🚀", { id: toastId });
        buscarTransacoes();
      } else {
        toast.error(data.message || "Falha no envio.", { id: toastId });
      }
    } catch (error) {
      toast.error("Erro de comunicação com o servidor.", { id: toastId });
    } finally {
      setEnviandoWhats(null);
    }
  };

  if (!contrato) return null;

  return (
    <>
      <div onClick={fechar} className={`fixed inset-0 bg-stone-900/60 dark:bg-black/80 backdrop-blur-sm z-40 transition-opacity duration-500 ${aberto ? "opacity-100" : "opacity-0 pointer-events-none"}`} />

      <div className={`fixed top-0 right-0 h-full w-full max-w-lg bg-stone-50 dark:bg-stone-950 border-l border-stone-200 dark:border-stone-800 shadow-2xl z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${aberto ? "translate-x-0" : "translate-x-full"}`}>
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
              <Receipt className="text-[#A67B5B]" /> Transações
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1 truncate max-w-[300px]">
              {contrato.titulo} • {contrato.parceiros.nome}
            </p>
          </div>
          <button onClick={fechar} className="p-2 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-200 dark:hover:bg-stone-800 transition-colors"><X size={24} /></button>
        </div>

        {/* Conteúdo Central */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Botão de Adicionar Nova Baixa */}
          {!mostrarForm ? (
            <button onClick={() => setMostrarForm(true)} className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl text-stone-500 dark:text-stone-400 hover:text-[#A67B5B] hover:border-[#A67B5B] hover:bg-[#A67B5B]/5 transition-all font-bold">
              <PlusCircle size={20} /> Registrar Novo Pagamento
            </button>
          ) : (
            <form onSubmit={registrarPagamento} className="bg-white dark:bg-stone-900 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-stone-800 dark:text-stone-100">Nova Baixa</h3>
                <button type="button" onClick={() => setMostrarForm(false)} className="text-stone-400 hover:text-red-500"><X size={18}/></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 flex items-center gap-1"><DollarSign size={12}/> Valor Pago</label>
                  <input required value={valorPago} onChange={(e) => setValorPago(e.target.value)} type="number" step="0.01" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#A67B5B]/50 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-stone-500 flex items-center gap-1"><Calendar size={12}/> Data</label>
                  <input required value={dataPagamento} onChange={(e) => setDataPagamento(e.target.value)} type="date" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#A67B5B]/50 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-500 flex items-center gap-1"><Receipt size={12}/> Link do Comprovante (Opcional)</label>
                <input value={linkComprovante} onChange={(e) => setLinkComprovante(e.target.value)} type="url" placeholder="https://..." className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#A67B5B]/50 outline-none" />
              </div>
              <button disabled={salvando} type="submit" className="w-full py-2.5 bg-[#A67B5B] hover:bg-[#966d50] text-white rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2">
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Salvar Pagamento
              </button>
            </form>
          )}

          {/* Lista de Histórico */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-wider">Histórico de Baixas</h3>
            {carregando ? (
              <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#A67B5B]" /></div>
            ) : transacoes.length === 0 ? (
              <p className="text-stone-500 dark:text-stone-400 text-sm text-center py-8 bg-white dark:bg-stone-900 rounded-2xl border border-dashed border-stone-200 dark:border-stone-800">Nenhum pagamento registrado ainda.</p>
            ) : (
              transacoes.map((t) => (
                <div key={t.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 shadow-sm flex items-center justify-between group hover:border-[#A67B5B]/30 transition-colors">
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-100 text-lg">R$ {parseFloat(t.valor_pago).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(t.data_pagamento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                    </p>
                  </div>
                  
                  {/* Botão do WhatsApp Integrado */}
                  <button 
                    onClick={() => dispararWhatsApp(t)}
                    disabled={enviandoWhats === t.id || t.status_whatsapp === 'enviado'}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${t.status_whatsapp === 'enviado' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 cursor-not-allowed' : 'bg-stone-100 dark:bg-stone-800 hover:bg-[#A67B5B] hover:text-white text-stone-600 dark:text-stone-300'}`}
                    title={t.status_whatsapp === 'enviado' ? 'Comprovante já enviado' : 'Enviar por WhatsApp'}
                  >
                    {enviandoWhats === t.id ? <Loader2 size={16} className="animate-spin" /> : t.status_whatsapp === 'enviado' ? <CheckCircle2 size={16} /> : <Send size={16} />}
                    <span className="hidden sm:inline">{t.status_whatsapp === 'enviado' ? 'Enviado' : 'Notificar'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}