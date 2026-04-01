"use client";

import { useState } from "react";
import { X, Plane, Bus, MapPin, Calendar, DollarSign, Save, Loader2, Ticket, Building } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DrawerLogisticaProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
  viagemId: string | null;
};

export default function DrawerLogistica({ aberto, fechar, aoSalvar, viagemId }: DrawerLogisticaProps) {
  const [salvando, setSalvando] = useState(false);

  // Estados do Formulário
  const [tipoTransporte, setTipoTransporte] = useState("voo");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [dataChegada, setDataChegada] = useState("");
  const [ciaOperadora, setCiaOperadora] = useState("");
  const [localizador, setLocalizador] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [pagoPelaInstituicao, setPagoPelaInstituicao] = useState(false);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viagemId) return toast.error("Nenhuma viagem selecionada.");

    setSalvando(true);
    const toastId = toast.loading("Emitindo cartão de embarque...");

    try {
      const { error } = await supabase.from("trechos_logistica").insert([
        {
          viagem_id: viagemId,
          tipo_transporte: tipoTransporte,
          origem,
          destino,
          data_partida: dataPartida, // datetime-local formato YYYY-MM-DDTHH:mm
          data_chegada: dataChegada || null,
          cia_operadora: ciaOperadora,
          codigo_localizador: localizador.toUpperCase(),
          valor_pago: parseFloat(valorPago.replace(",", ".") || "0"),
          pago_pela_instituicao: pagoPelaInstituicao,
        },
      ]);

      if (error) throw error;

      toast.success("Trecho logístico adicionado com sucesso! 🎟️", { id: toastId });
      
      // Limpa os dados principais para o próximo cadastro
      setOrigem("");
      setDestino("");
      setDataPartida("");
      setDataChegada("");
      setLocalizador("");
      setValorPago("");
      
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
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Ticket size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">Novo Trecho</h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Voo, Ônibus ou Carro</p>
            </div>
          </div>
          <button onClick={fechar} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Formulário */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="form-logistica" onSubmit={handleSalvar} className="space-y-6">
            
            {/* Seletor Rápido de Tipo */}
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl">
              <button type="button" onClick={() => setTipoTransporte("voo")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${tipoTransporte === "voo" ? "bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white" : "text-stone-500 hover:text-stone-700"}`}>
                <Plane size={16} /> Voo
              </button>
              <button type="button" onClick={() => setTipoTransporte("onibus")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${tipoTransporte === "onibus" ? "bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white" : "text-stone-500 hover:text-stone-700"}`}>
                <Bus size={16} /> Ônibus
              </button>
            </div>

            {/* Origem e Destino */}
            <div className="grid grid-cols-1 gap-4 relative">
              <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-stone-200 dark:bg-stone-800 z-0 border-dashed border-l-2"></div>
              
              <div className="space-y-1 relative z-10">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-8">Origem (Embarque)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-900 border-2 border-white dark:border-stone-950 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-stone-400" />
                  </div>
                  <input required value={origem} onChange={(e) => setOrigem(e.target.value)} type="text" placeholder="Ex: REC (Recife)" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium uppercase" />
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-8">Destino (Desembarque)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-stone-100 border-2 border-white dark:border-stone-950 flex items-center justify-center shrink-0 text-white dark:text-stone-900">
                    <MapPin size={16} />
                  </div>
                  <input required value={destino} onChange={(e) => setDestino(e.target.value)} type="text" placeholder="Ex: SLZ (São Luís)" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium uppercase" />
                </div>
              </div>
            </div>

            {/* Datas e Horários */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Calendar size={14} /> Embarque
                </label>
                <input required value={dataPartida} onChange={(e) => setDataPartida(e.target.value)} type="datetime-local" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs" />
              </div>
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <Calendar size={14} /> Chegada
                </label>
                <input value={dataChegada} onChange={(e) => setDataChegada(e.target.value)} type="datetime-local" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs" />
              </div>
            </div>

            {/* Cia e Localizador */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400">Cia / Viação</label>
                <input value={ciaOperadora} onChange={(e) => setCiaOperadora(e.target.value)} type="text" placeholder="Ex: Azul" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm" />
              </div>
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400">Localizador</label>
                <input value={localizador} onChange={(e) => setLocalizador(e.target.value)} type="text" placeholder="Ex: XY89ZK" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm uppercase font-mono font-bold text-indigo-600" />
              </div>
            </div>

            <div className="h-px bg-stone-100 dark:bg-stone-800 w-full my-4"></div>

            {/* Financeiro */}
            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <DollarSign size={16} /> Custo da Passagem (R$)
                </label>
                <input value={valorPago} onChange={(e) => setValorPago(e.target.value)} type="number" step="0.01" placeholder="0,00" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-lg" />
              </div>
              
              {/* Toggle de Pagamento Institucional */}
              <label className="flex items-start gap-3 p-4 border border-stone-200 dark:border-stone-800 rounded-xl cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-colors">
                <div className="mt-0.5">
                  <input type="checkbox" checked={pagoPelaInstituicao} onChange={(e) => setPagoPelaInstituicao(e.target.checked)} className="w-5 h-5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <Building size={14} className="text-indigo-500" /> Pago pela Instituição
                  </p>
                  <p className="text-xs text-stone-500 mt-1">Marque se a Motriz ou o Governo pagou esta passagem. O valor não será descontado do seu ROI pessoal.</p>
                </div>
              </label>
            </div>

          </form>
        </div>

        {/* Rodapé */}
        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20 flex gap-3">
          <button type="button" onClick={fechar} className="flex-1 py-3.5 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">Cancelar</button>
          <button type="submit" form="form-logistica" disabled={salvando} className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
            {salvando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            <span>Emitir Bilhete</span>
          </button>
        </div>

      </div>
    </>
  );
}