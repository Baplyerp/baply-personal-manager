"use client";

import { useState, useEffect } from "react";
import { Plane, Plus, Loader2, MapPin, Briefcase, TrendingUp, ShieldCheck, Ticket, Calendar, Bus, ArrowRight, Building, DollarSign, Settings } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { usePerfil } from "@/contexts/PerfilContext";
import DrawerViagem from "@/components/DrawerViagem";
import DrawerLogistica from "@/components/DrawerLogistica";

export default function ViagensPage() {
  const { perfil } = usePerfil();
  const [viagens, setViagens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Controle de Drawers
  const [drawerViagemAberto, setDrawerViagemAberto] = useState(false);
  const [drawerLogisticaAberto, setDrawerLogisticaAberto] = useState(false);
  const [viagemSelecionadaId, setViagemSelecionadaId] = useState<string | null>(null);
  const [trechoSendoEditado, setTrechoSendoEditado] = useState<any>(null); // 👈 Estado que guarda o bilhete a editar

  // Estados de métricas simuladas (serão substituídas por cálculos reais depois)
  const custoTotal = 0; 
  const beneficios = 0;
  const custoEfetivo = custoTotal - beneficios;
  const renda = perfil?.renda_mensal || 0;
  const mesesPayback = renda > 0 ? (custoEfetivo / (renda * 0.3)).toFixed(1) : "0";

  const buscarViagens = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("viagens")
      .select("*, trechos_logistica(*), beneficios_viagem(*)")
      .order("criado_em", { ascending: false });

    if (data) setViagens(data);
    if (error) toast.error("Erro ao carregar o Hub de Transição.");
    setCarregando(false);
  };

  useEffect(() => {
    buscarViagens();
  }, []);

  // 🧠 Abre o formulário limpo para um NOVO trecho
  const abrirNovaLogistica = (idDaViagem: string) => {
    setViagemSelecionadaId(idDaViagem);
    setTrechoSendoEditado(null);
    setDrawerLogisticaAberto(true);
  };

  // 🧠 Abre o formulário preenchido para EDITAR um trecho
  const abrirEdicaoLogistica = (idDaViagem: string, trecho: any) => {
    setViagemSelecionadaId(idDaViagem);
    setTrechoSendoEditado(trecho);
    setDrawerLogisticaAberto(true);
  };

  // Função auxiliar para formatar a data do ticket
  const formatarData = (dataStr: string) => {
    if (!dataStr) return "--";
    const data = new Date(dataStr);
    return data.toLocaleString('pt-PT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ' -');
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
              <Plane className="text-[#A67B5B]" size={32} />
              Hub de Transição & Logística
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2">
              Planeamento de rotas, passagens e cálculo de ROI corporativo.
            </p>
          </div>
          <button 
            onClick={() => setDrawerViagemAberto(true)} 
            className="flex items-center gap-2 px-5 py-3 bg-[#A67B5B] hover:bg-[#8a6347] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-[#A67B5B]/20 transition-all hover:-translate-y-1"
          >
            <Plus size={20} />
            <span>Nova Transição</span>
          </button>
        </div>

        {/* Painel de Inteligência (ROI) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-stone-500 flex items-center gap-2"><Briefcase size={16}/> Custo Operacional</p>
            <p className="text-2xl font-black mt-2">R$ {custoTotal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-emerald-500 flex items-center gap-2"><ShieldCheck size={16}/> Benefícios / Ajuda</p>
            <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">R$ {beneficios.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between md:col-span-2 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-950 dark:to-stone-900 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-stone-400">Métrica de Recuperação (Payback)</p>
              <div className="flex items-end gap-4 mt-2">
                <p className="text-3xl font-black">R$ {custoEfetivo.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-stone-300 mb-1 border-l border-white/20 pl-4">
                  Retorno estimado em <span className="font-bold text-[#A67B5B] bg-[#A67B5B]/20 px-2 py-0.5 rounded-md">{mesesPayback} meses</span> de salário.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Área de Logística */}
        {carregando ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#A67B5B]" size={40} /></div>
        ) : viagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
            <MapPin size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-300">Nenhum roteiro ativo</h3>
            <p className="text-stone-500 text-sm mt-2 max-w-md text-center">
              Inicie o mapeamento da sua rota saindo de Palmares rumo ao novo desafio na Secretaria de Estado.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {viagens.map((viagem) => (
              <div key={viagem.id} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                
                {/* Header do Roteiro */}
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                        {viagem.proposito}
                      </span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${viagem.status === 'planejamento' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30'}`}>
                        {viagem.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="font-black text-2xl text-stone-900 dark:text-white">{viagem.titulo}</h3>
                    {viagem.data_inicio && (
                      <p className="text-sm text-stone-500 flex items-center gap-1.5 mt-1">
                        <Calendar size={14} /> Início previsto: {new Date(viagem.data_inicio).toLocaleDateString('pt-PT')}
                      </p>
                    )}
                  </div>
                  
                  {/* Botões de Ação do Roteiro */}
                  <div className="flex gap-2">
                    <button onClick={() => abrirNovaLogistica(viagem.id)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm transition-colors border border-indigo-200 dark:border-indigo-500/20">
                      <Ticket size={16} /> + Trecho
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-200 dark:border-emerald-500/20">
                      <ShieldCheck size={16} /> + Benefício
                    </button>
                  </div>
                </div>
                
                {/* Boarding Passes (Trechos) */}
                <div className="p-6 bg-stone-50/50 dark:bg-stone-950/50">
                  {(!viagem.trechos_logistica || viagem.trechos_logistica.length === 0) ? (
                    <div className="text-center py-6">
                      <Ticket size={32} className="mx-auto text-stone-300 dark:text-stone-700 mb-2" />
                      <p className="text-sm text-stone-500 font-medium">Nenhum trecho logístico registado ainda.</p>
                      <p className="text-xs text-stone-400">Clique em "+ Trecho" para adicionar voos ou autocarros.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {viagem.trechos_logistica.map((trecho: any) => (
                        <div key={trecho.id} className="relative flex bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                          
                          {/* ⚙️ O Botão de Edição Invisível (Aparece ao passar o rato) */}
                          <button 
                            onClick={() => abrirEdicaoLogistica(viagem.id, trecho)}
                            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-sm border border-stone-200 dark:border-stone-700"
                            title="Editar Bilhete"
                          >
                            <Settings size={16} />
                          </button>

                          {/* Lado Esquerdo do Ticket (Cia e Ícone) */}
                          <div className="w-24 bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center p-3 border-r border-dashed border-stone-300 dark:border-stone-700 relative overflow-hidden">
                            {/* Furos do Ticket */}
                            <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-stone-50/50 dark:bg-stone-950/50 border-b border-l border-stone-200 dark:border-stone-800 z-10"></div>
                            <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-stone-50/50 dark:bg-stone-950/50 border-t border-l border-stone-200 dark:border-stone-800 z-10"></div>
                            
                            {/* Renderização Inteligente da Logo (Com Efeito de Zoom) */}
                            {trecho.cia_logo_url ? (
                              <div className="w-12 h-12 rounded-full mb-2 shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center bg-white relative z-0">
                                <img src={trecho.cia_logo_url} alt={trecho.cia_operadora} className="w-full h-full object-contain p-1.5 group-hover:scale-110 transition-transform duration-500" />
                              </div>
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-sm relative z-0 group-hover:scale-110 transition-transform duration-500 ${trecho.tipo_transporte === 'voo' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                {trecho.tipo_transporte === 'voo' ? <Plane size={18} /> : <Bus size={18} />}
                              </div>
                            )}

                            <span className="text-[10px] font-black uppercase text-stone-500 text-center truncate w-full relative z-0" title={trecho.cia_operadora}>{trecho.cia_operadora || "CIA"}</span>
                          </div>

                          {/* Lado Direito do Ticket (Detalhes) */}
                          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-0.5">Partida</p>
                                <p className="font-black text-lg text-stone-800 dark:text-stone-100 truncate">{trecho.origem}</p>
                              </div>
                              <ArrowRight size={16} className="text-stone-300 mx-2 shrink-0 group-hover:text-indigo-400 transition-colors duration-500 group-hover:translate-x-1" />
                              <div className="flex-1 text-right min-w-0 pr-6"> {/* Espaço extra para o botão de editar */}
                                <p className="text-xs text-stone-400 uppercase font-bold tracking-wider mb-0.5">Chegada</p>
                                <p className="font-black text-lg text-stone-800 dark:text-stone-100 truncate">{trecho.destino}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 dark:bg-stone-950/50 rounded-lg p-2 border border-stone-100 dark:border-stone-800 group-hover:border-indigo-100 dark:group-hover:border-indigo-900/50 transition-colors">
                              <div>
                                <p className="text-stone-400 font-medium">Embarque</p>
                                <p className="font-bold text-stone-700 dark:text-stone-300">{formatarData(trecho.data_partida)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-stone-400 font-medium">Localizador</p>
                                <p className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm tracking-widest">{trecho.codigo_localizador || "---"}</p>
                              </div>
                            </div>

                            {/* Info Financeira no Ticket */}
                            <div className="mt-3 flex items-center justify-between">
                              {trecho.pago_pela_instituicao ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-500 dark:bg-stone-800">
                                  <Building size={10} /> Institucional
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-600 dark:bg-rose-500/10">
                                  <DollarSign size={10} /> Custo Pessoal
                                </span>
                              )}
                              <p className="font-black text-sm text-stone-700 dark:text-stone-200">
                                R$ {trecho.valor_pago ? trecho.valor_pago.toLocaleString('pt-PT', {minimumFractionDigits: 2}) : "0,00"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <DrawerViagem 
        aberto={drawerViagemAberto} 
        fechar={() => setDrawerViagemAberto(false)} 
        aoSalvar={buscarViagens} 
      />
      
      {/* O Drawer Inteligente agora recebe a variável de edição */}
      <DrawerLogistica
        aberto={drawerLogisticaAberto}
        fechar={() => setDrawerLogisticaAberto(false)}
        aoSalvar={buscarViagens}
        viagemId={viagemSelecionadaId}
        trechoEditando={trechoSendoEditado}
      />
    </>
  );
}