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
  
  const [drawerViagemAberto, setDrawerViagemAberto] = useState(false);
  const [viagemSendoEditada, setViagemSendoEditada] = useState<any>(null);

  const [drawerLogisticaAberto, setDrawerLogisticaAberto] = useState(false);
  const [viagemSelecionadaId, setViagemSelecionadaId] = useState<string | null>(null);
  const [trechoSendoEditado, setTrechoSendoEditado] = useState<any>(null);

  const [custoTotal, setCustoTotal] = useState(0);
  const [beneficios, setBeneficios] = useState(0);
  
  const custoEfetivo = custoTotal - beneficios;
  const renda = perfil?.renda_mensal || 0;
  const mesesPayback = renda > 0 ? (custoEfetivo / (renda * 0.3)).toFixed(1) : "0";

  const calcularMetricas = (dadosViagens: any[]) => {
    let custoCalc = 0;
    let beneficiosCalc = 0;

    dadosViagens.forEach(v => {
      v.trechos_logistica?.forEach((t: any) => {
        if (!t.pago_pela_instituicao) {
          custoCalc += Number(t.valor_pago) || 0;
        }
      });
      v.beneficios_viagem?.forEach((b: any) => {
        beneficiosCalc += Number(b.valor) || 0;
      });
    });

    setCustoTotal(custoCalc);
    setBeneficios(beneficiosCalc);
  };

  const buscarViagens = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("viagens")
      .select("*, trechos_logistica(*), beneficios_viagem(*)")
      .order("criado_em", { ascending: false });

    if (data) {
      setViagens(data);
      calcularMetricas(data);
    }
    if (error) toast.error("Erro ao carregar o Hub de Transição.");
    setCarregando(false);
  };

  useEffect(() => {
    buscarViagens();
  }, []);

  const abrirNovaViagem = () => {
    setViagemSendoEditada(null);
    setDrawerViagemAberto(true);
  };

  const abrirEdicaoViagem = (viagem: any) => {
    setViagemSendoEditada(viagem);
    setDrawerViagemAberto(true);
  };

  const abrirNovaLogistica = (idDaViagem: string) => {
    setViagemSelecionadaId(idDaViagem);
    setTrechoSendoEditado(null);
    setDrawerLogisticaAberto(true);
  };

  const abrirEdicaoLogistica = (idDaViagem: string, trecho: any) => {
    setViagemSelecionadaId(idDaViagem);
    setTrechoSendoEditado(trecho);
    setDrawerLogisticaAberto(true);
  };

  // 🧠 O Motor em Cascata (Cascade Resolution Engine) espelhado na view principal
  const obterLogoSegura = (nomeCia: string, urlSalva?: string) => {
    if (urlSalva) return urlSalva; 
    if (!nomeCia) return null;
    
    const termo = nomeCia.toLowerCase().trim();
    
    // CAMADA 1: Cofre VIP
    if (termo.includes('azul')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/LOGO_AZUL_LINHAS_AEREAS.png/960px-LOGO_AZUL_LINHAS_AEREAS.png';
    if (termo.includes('gol')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/GOL_Linhas_A%C3%A9reas_Inteligentes_logo.svg/512px-GOL_Linhas_A%C3%A9reas_Inteligentes_logo.svg.png';
    if (termo.includes('latam')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/LATAM_Airlines_logo.svg/512px-LATAM_Airlines_logo.svg.png';
    if (termo.includes('guanabara')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Logo_Guanabara_2023.png/320px-Logo_Guanabara_2023.png';
    if (termo.includes('cometa')) return 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Viacao_cometa_logo.png';
    if (termo.includes('progresso')) return 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Auto_Via%C3%A7%C3%A3o_Progresso_logo.png/320px-Auto_Via%C3%A7%C3%A3o_Progresso_logo.png';
    if (termo.includes("tap")) return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/TAP_Air_Portugal_logo.svg/512px-TAP_Air_Portugal_logo.svg.png";
    if (termo.includes('motriz')) return 'https://institutomotriz.org.br/wp-content/uploads/2023/11/motriz_logo_cor.png';
    
    // CAMADA 2: Heurística do Google Favicon
    const dominioLimpo = termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    if (dominioLimpo.length > 2) {
      return `https://www.google.com/s2/favicons?domain=${dominioLimpo}.com.br&sz=256`;
    }

    return null; 
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return "--";
    const data = new Date(dataStr);
    return data.toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).replace(',', ' -');
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
              <Plane className="text-[#A67B5B]" size={32} />
              Hub de Transição & Logística
            </h2>
            <p className="text-stone-500 dark:text-stone-400 mt-2">
              Métricas e rotas atualizadas em tempo real.
            </p>
          </div>
          <button onClick={abrirNovaViagem} className="flex items-center gap-2 px-5 py-3 bg-[#A67B5B] hover:bg-[#8a6347] text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:shadow-[#A67B5B]/30 transition-all hover:-translate-y-1">
            <Plus size={20} />
            <span>Nova Transição</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-rose-500/10 hover:border-rose-200 dark:hover:border-rose-900/50 hover:-translate-y-1 transition-all duration-500 cursor-default">
            <p className="text-sm font-semibold text-stone-500 flex items-center gap-2">
              <Briefcase size={16} className="text-stone-400 group-hover:text-rose-500 transition-colors duration-300"/> 
              Custo Operacional
            </p>
            <p className="text-2xl font-black mt-2 text-stone-800 dark:text-stone-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors duration-300">
              R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:-translate-y-1 transition-all duration-500 cursor-default">
            <p className="text-sm font-semibold text-stone-500 flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-500 group-hover:scale-110 transition-transform duration-300"/> 
              Benefícios / Ajuda
            </p>
            <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500 transition-colors duration-300">
              R$ {beneficios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="p-6 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 rounded-3xl border border-stone-800 shadow-lg flex flex-col justify-between md:col-span-2 text-white relative overflow-hidden group hover:shadow-2xl hover:shadow-[#A67B5B]/20 hover:-translate-y-1 transition-all duration-500 cursor-default">
            <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4 group-hover:rotate-12 group-hover:scale-125 transition-transform duration-700 ease-out">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-stone-400 group-hover:text-stone-300 transition-colors duration-300">Métrica de Recuperação (Payback)</p>
              <div className="flex items-end gap-4 mt-2">
                <p className="text-3xl font-black text-white">
                  R$ {custoEfetivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-sm text-stone-300 mb-1 border-l border-white/20 pl-4">
                  Retorno em <span className="font-bold text-white bg-[#A67B5B] px-2.5 py-1 rounded-md shadow-inner">{mesesPayback} meses</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {carregando ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#A67B5B]" size={40} /></div>
        ) : viagens.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-3xl bg-white/50 dark:bg-stone-900/50">
            <MapPin size={48} className="text-stone-300 dark:text-stone-700 mb-4" />
            <h3 className="text-lg font-semibold text-stone-600 dark:text-stone-300">Nenhum roteiro ativo</h3>
          </div>
        ) : (
          <div className="space-y-8">
            {viagens.map((viagem) => (
              <div key={viagem.id} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden group/viagem">
                
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
                  
                  <button onClick={() => abrirEdicaoViagem(viagem)} className="absolute top-4 right-4 p-2 text-stone-300 hover:text-[#A67B5B] bg-stone-50 hover:bg-[#A67B5B]/10 dark:bg-stone-800 dark:hover:bg-[#A67B5B]/20 rounded-full transition-all md:hidden group-hover/viagem:flex z-10" title="Editar Projeto">
                    <Settings size={18} />
                  </button>

                  <div className="pr-12 md:pr-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400">{viagem.proposito}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md ${viagem.status === 'planejamento' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>{viagem.status.replace('_', ' ')}</span>
                    </div>
                    <h3 className="font-black text-2xl text-stone-900 dark:text-white flex items-center gap-3">
                      {viagem.titulo}
                    </h3>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => abrirNovaLogistica(viagem.id)} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-bold text-sm transition-colors border border-indigo-200 dark:border-indigo-500/20">
                      <Ticket size={16} /> + Trecho
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-sm transition-colors border border-emerald-200 dark:border-emerald-500/20">
                      <ShieldCheck size={16} /> + Benefício
                    </button>
                  </div>
                </div>
                
                <div className="p-6 bg-stone-50/50 dark:bg-stone-950/50">
                  {(!viagem.trechos_logistica || viagem.trechos_logistica.length === 0) ? (
                    <div className="text-center py-6">
                      <Ticket size={32} className="mx-auto text-stone-300 dark:text-stone-700 mb-2 animate-pulse" />
                      <p className="text-sm text-stone-500 font-medium">Nenhum trecho logístico registado ainda.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {viagem.trechos_logistica.map((trecho: any) => {
                        const logoDefinitiva = obterLogoSegura(trecho.cia_operadora, trecho.cia_logo_url);
                        
                        return (
                          <div key={trecho.id} className="relative flex bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 group">
                            
                            <button onClick={() => abrirEdicaoLogistica(viagem.id, trecho)} className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-stone-800/80 backdrop-blur-md text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 shadow-sm border border-stone-200 dark:border-stone-700 hover:scale-110" title="Editar Bilhete">
                              <Settings size={16} />
                            </button>

                            <div className="w-24 bg-stone-100 dark:bg-stone-800 flex flex-col items-center justify-center p-3 border-r border-dashed border-stone-300 dark:border-stone-700 relative overflow-hidden group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors duration-500">
                              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-stone-50/50 dark:bg-stone-950/50 border-b border-l border-stone-200 dark:border-stone-800 z-10"></div>
                              <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-stone-50/50 dark:bg-stone-950/50 border-t border-l border-stone-200 dark:border-stone-800 z-10"></div>
                              
                              {logoDefinitiva ? (
                                <div className="w-12 h-12 rounded-full mb-2 shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden flex items-center justify-center bg-white relative z-0">
                                  <img 
                                    src={logoDefinitiva} 
                                    alt={trecho.cia_operadora} 
                                    className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white mb-2 shadow-sm relative z-0 group-hover:scale-110 transition-transform duration-500 ${trecho.tipo_transporte === 'voo' ? 'bg-indigo-500' : 'bg-amber-500'}`}>
                                  {trecho.tipo_transporte === 'voo' ? <Plane size={18} /> : <Bus size={18} />}
                                </div>
                              )}
                              <span className="text-[10px] font-black uppercase text-stone-500 text-center truncate w-full relative z-0">{trecho.cia_operadora || "CIA"}</span>
                            </div>

                            <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-lg text-stone-800 dark:text-stone-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{trecho.origem}</p>
                                </div>
                                <ArrowRight size={16} className="text-stone-300 mx-2 shrink-0 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all duration-300" />
                                <div className="flex-1 text-right min-w-0 pr-6">
                                  <p className="font-black text-lg text-stone-800 dark:text-stone-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{trecho.destino}</p>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex items-center justify-between">
                                {trecho.pago_pela_instituicao ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-500 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"><Building size={10} /> Institucional</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-600 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/30"><DollarSign size={10} /> Custo Pessoal</span>
                                )}
                                <p className="font-black text-sm text-stone-700 dark:text-stone-200 bg-stone-50 dark:bg-stone-950/50 px-2.5 py-0.5 rounded-md border border-stone-100 dark:border-stone-800">
                                  R$ {trecho.valor_pago ? trecho.valor_pago.toLocaleString('pt-BR', {minimumFractionDigits: 2}) : "0,00"}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
        viagemEditando={viagemSendoEditada}
      />
      
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