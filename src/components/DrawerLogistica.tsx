"use client";

import { useState, useEffect } from "react";
import { X, Plane, Bus, MapPin, Calendar, DollarSign, Save, Loader2, Ticket, Building, Link as LinkIcon, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DrawerLogisticaProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
  viagemId: string | null;
  trechoEditando?: any;
};

// 🧠 O Motor em Cascata (Cascade Resolution Engine)
const inferirLogoInteligente = (nomeDigitado: string) => {
  if (!nomeDigitado) return "";
  const termo = nomeDigitado.toLowerCase().trim();

  // CAMADA 1: Cofre VIP (Correspondência Exata e Segura)
  if (termo.includes("azul")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/LOGO_AZUL_LINHAS_AEREAS.png/960px-LOGO_AZUL_LINHAS_AEREAS.png";
  if (termo.includes("gol")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/GOL_Linhas_A%C3%A9reas_Inteligentes_logo.svg/512px-GOL_Linhas_A%C3%A9reas_Inteligentes_logo.svg.png";
  if (termo.includes("latam")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/LATAM_Airlines_logo.svg/512px-LATAM_Airlines_logo.svg.png";
  if (termo.includes("guanabara")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_Guanabara_2023.png/320px-Logo_Guanabara_2023.png";
  if (termo.includes("cometa")) return "https://upload.wikimedia.org/wikipedia/commons/7/7b/Viacao_cometa_logo.png";
  if (termo.includes("progresso")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Auto_Via%C3%A7%C3%A3o_Progresso_logo.png/320px-Auto_Via%C3%A7%C3%A3o_Progresso_logo.png";
  if (termo.includes("tap")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/TAP_Air_Portugal_logo.svg/512px-TAP_Air_Portugal_logo.svg.png";
  if (termo.includes("motriz")) return "https://institutomotriz.org.br/wp-content/uploads/2023/11/motriz_logo_cor.png";

  // CAMADA 2: Heurística do Google Favicon (Transforma nome em domínio)
  const dominioLimpo = termo
    .normalize("NFD") // Separa os acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .replace(/[^a-z0-9]/g, ""); // Remove espaços e caracteres especiais

  if (dominioLimpo.length > 2) {
    // Busca no cache global do Google (sz=256 força alta resolução)
    return `https://www.google.com/s2/favicons?domain=${dominioLimpo}.com.br&sz=256`;
  }

  // CAMADA 3: Retorna vazio para permitir Fallback Manual
  return "";
};

export default function DrawerLogistica({ aberto, fechar, aoSalvar, viagemId, trechoEditando }: DrawerLogisticaProps) {
  const [salvando, setSalvando] = useState(false);
  const [mostrarLinkManual, setMostrarLinkManual] = useState(false);

  const [tipoTransporte, setTipoTransporte] = useState("voo");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");
  const [dataPartida, setDataPartida] = useState("");
  const [dataChegada, setDataChegada] = useState("");
  const [ciaOperadora, setCiaOperadora] = useState("");
  const [ciaLogoUrl, setCiaLogoUrl] = useState(""); 
  const [localizador, setLocalizador] = useState("");
  const [valorPago, setValorPago] = useState("");
  const [pagoPelaInstituicao, setPagoPelaInstituicao] = useState(false);

  useEffect(() => {
    if (aberto && trechoEditando) {
      setTipoTransporte(trechoEditando.tipo_transporte || "voo");
      setOrigem(trechoEditando.origem || "");
      setDestino(trechoEditando.destino || "");
      setDataPartida(trechoEditando.data_partida ? trechoEditando.data_partida.substring(0, 16) : "");
      setDataChegada(trechoEditando.data_chegada ? trechoEditando.data_chegada.substring(0, 16) : "");
      setCiaOperadora(trechoEditando.cia_operadora || "");
      setCiaLogoUrl(trechoEditando.cia_logo_url || "");
      setLocalizador(trechoEditando.codigo_localizador || "");
      setValorPago(trechoEditando.valor_pago ? trechoEditando.valor_pago.toString() : "");
      setPagoPelaInstituicao(trechoEditando.pago_pela_instituicao || false);
      
      // Abre o link manual se houver URL salva e não for gerada automaticamente
      const urlGerada = inferirLogoInteligente(trechoEditando.cia_operadora || "");
      if (trechoEditando.cia_logo_url && trechoEditando.cia_logo_url !== urlGerada) {
        setMostrarLinkManual(true);
      }
    } else if (aberto && !trechoEditando) {
      setTipoTransporte("voo"); setOrigem(""); setDestino(""); setDataPartida(""); setDataChegada("");
      setCiaOperadora(""); setCiaLogoUrl(""); setLocalizador(""); setValorPago(""); setPagoPelaInstituicao(false);
      setMostrarLinkManual(false);
    }
  }, [aberto, trechoEditando]);

  // Aplica o Motor Inteligente enquanto o utilizador digita
  useEffect(() => {
    if (!mostrarLinkManual) {
      const logoGerada = inferirLogoInteligente(ciaOperadora);
      
      // Protege para não apagar a logo caso estejamos no modo de edição e não tenhamos modificado o nome
      if (trechoEditando && trechoEditando.cia_operadora === ciaOperadora) {
        return; // Mantém a que veio da base de dados
      }
      
      setCiaLogoUrl(logoGerada);
    }
  }, [ciaOperadora, mostrarLinkManual, trechoEditando]);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viagemId) return toast.error("Nenhuma viagem selecionada.");

    setSalvando(true);
    const toastId = toast.loading(trechoEditando ? "A atualizar bilhete..." : "A emitir cartão de embarque...");

    const dadosLogistica = {
      viagem_id: viagemId,
      tipo_transporte: tipoTransporte,
      origem,
      destino,
      data_partida: dataPartida, 
      data_chegada: dataChegada || null,
      cia_operadora: ciaOperadora,
      cia_logo_url: ciaLogoUrl,
      codigo_localizador: localizador.toUpperCase(),
      valor_pago: parseFloat(valorPago.replace(",", ".") || "0"),
      pago_pela_instituicao: pagoPelaInstituicao,
    };

    try {
      if (trechoEditando) {
        const { error } = await supabase.from("trechos_logistica").update(dadosLogistica).eq('id', trechoEditando.id);
        if (error) throw error;
        toast.success("Trecho atualizado com sucesso! 🔄", { id: toastId });
      } else {
        const { error } = await supabase.from("trechos_logistica").insert([dadosLogistica]);
        if (error) throw error;
        toast.success("Trecho logístico adicionado com sucesso! 🎟️", { id: toastId });
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
      <div onClick={fechar} className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-200 dark:border-stone-800 z-50 animate-in slide-in-from-right duration-500 flex flex-col">
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${trechoEditando ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
              {trechoEditando ? <RefreshCw size={20} /> : <Ticket size={20} />}
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">
                {trechoEditando ? "Editar Trecho" : "Novo Trecho"}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">Voo, Autocarro ou Carro</p>
            </div>
          </div>
          <button onClick={fechar} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form id="form-logistica" onSubmit={handleSalvar} className="space-y-6">
            
            <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl">
              <button type="button" onClick={() => setTipoTransporte("voo")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${tipoTransporte === "voo" ? "bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white" : "text-stone-500 hover:text-stone-700"}`}>
                <Plane size={16} /> Voo
              </button>
              <button type="button" onClick={() => setTipoTransporte("onibus")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${tipoTransporte === "onibus" ? "bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white" : "text-stone-500 hover:text-stone-700"}`}>
                <Bus size={16} /> Autocarro
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 relative">
              <div className="absolute left-[19px] top-10 bottom-10 w-0.5 bg-stone-200 dark:bg-stone-800 z-0 border-dashed border-l-2"></div>
              
              <div className="space-y-1 relative z-10">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-8">Origem (Embarque)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-stone-900 border-2 border-white dark:border-stone-950 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-stone-400" />
                  </div>
                  <input required value={origem} onChange={(e) => setOrigem(e.target.value)} type="text" placeholder="Ex: REC" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium uppercase" />
                </div>
              </div>

              <div className="space-y-1 relative z-10">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider ml-8">Destino (Desembarque)</label>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 dark:bg-stone-100 border-2 border-white dark:border-stone-950 flex items-center justify-center shrink-0 text-white dark:text-stone-900">
                    <MapPin size={16} />
                  </div>
                  <input required value={destino} onChange={(e) => setDestino(e.target.value)} type="text" placeholder="Ex: SLZ" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium uppercase" />
                </div>
              </div>
            </div>

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

            <div className="space-y-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/10 transition-all">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Sparkles size={12} className={ciaLogoUrl && !mostrarLinkManual ? "animate-pulse text-amber-500" : ""} /> 
                  {ciaLogoUrl && !mostrarLinkManual ? "Motor AI Ativado" : "Auto-Logo Nativa"}
                </h4>
                <button type="button" onClick={() => setMostrarLinkManual(!mostrarLinkManual)} className="text-[10px] text-stone-400 hover:text-indigo-600 underline">
                  Inserir link manual
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-stone-500">Cia / Viação</label>
                  <div className="relative">
                    <input 
                      value={ciaOperadora} 
                      onChange={(e) => setCiaOperadora(e.target.value)} 
                      type="text" 
                      placeholder="Ex: Azul ou Cometa" 
                      className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl pl-3 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm shadow-sm" 
                    />
                    {ciaLogoUrl && (
                      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg overflow-hidden bg-white shadow-sm border border-stone-100 animate-in zoom-in duration-300">
                        <img src={ciaLogoUrl} alt="Preview" className="w-full h-full object-contain p-1" 
                          onError={(e) => {
                            // Se o favicon do Google falhar silenciosamente, escondemos a imagem quebrada
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-xs font-semibold text-stone-500">Localizador</label>
                  <input value={localizador} onChange={(e) => setLocalizador(e.target.value)} type="text" placeholder="Ex: XY89ZK" className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm uppercase font-mono font-bold text-indigo-600 shadow-sm" />
                </div>
              </div>
              
              {mostrarLinkManual && (
                <div className="space-y-2 group animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                    <LinkIcon size={12} /> Link Direto da Imagem
                  </label>
                  <input value={ciaLogoUrl} onChange={(e) => setCiaLogoUrl(e.target.value)} type="url" placeholder="https://..." className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-xs text-stone-500 truncate" />
                </div>
              )}
            </div>

            <div className="h-px bg-stone-100 dark:bg-stone-800 w-full my-4"></div>

            <div className="space-y-4">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2">
                  <DollarSign size={16} /> Custo da Passagem (R$)
                </label>
                <input value={valorPago} onChange={(e) => setValorPago(e.target.value)} type="number" step="0.01" placeholder="0,00" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-lg" />
              </div>
              
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

        <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20 flex gap-3">
          <button type="button" onClick={fechar} className="flex-1 py-3.5 px-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 rounded-xl font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors">Cancelar</button>
          <button type="submit" form="form-logistica" disabled={salvando} className={`flex-1 py-3.5 px-4 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0 ${trechoEditando ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
            {salvando ? <Loader2 size={20} className="animate-spin" /> : (trechoEditando ? <RefreshCw size={20} /> : <Save size={20} />)}
            <span>{trechoEditando ? "Atualizar" : "Emitir Bilhete"}</span>
          </button>
        </div>

      </div>
    </>
  );
}