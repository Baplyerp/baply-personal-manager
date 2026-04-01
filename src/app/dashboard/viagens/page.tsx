"use client";

import { useState, useEffect } from "react";
import { Plane, Plus, Loader2, MapPin, Briefcase, TrendingUp, ShieldCheck, Ticket } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { usePerfil } from "@/contexts/PerfilContext";
import DrawerViagem from "@/components/DrawerViagem";

export default function ViagensPage() {
  const { perfil } = usePerfil();
  const [viagens, setViagens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [drawerAberto, setDrawerAberto] = useState(false);

  // Estados de métricas simuladas (serão substituídas pelo banco real)
  const custoTotal = 0; 
  const beneficios = 0;
  const custoEfetivo = custoTotal - beneficios;
  const renda = perfil?.renda_mensal || 0;
  const mesesPayback = renda > 0 ? (custoEfetivo / (renda * 0.3)).toFixed(1) : "0"; // Assumindo que 30% da renda vai para cobrir a mudança

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
              Planejamento de rotas, passagens e cálculo de ROI corporativo.
            </p>
          </div>
          <button 
            onClick={() => setDrawerAberto(true)} 
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
            <p className="text-2xl font-black mt-2">R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between">
            <p className="text-sm font-semibold text-emerald-500 flex items-center gap-2"><ShieldCheck size={16}/> Benefícios / Ajuda</p>
            <p className="text-2xl font-black mt-2 text-emerald-600 dark:text-emerald-400">R$ {beneficios.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-6 bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between md:col-span-2 bg-gradient-to-r from-stone-900 to-stone-800 dark:from-stone-950 dark:to-stone-900 text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 scale-150 -translate-y-1/4 translate-x-1/4">
              <TrendingUp size={120} />
            </div>
            <div className="relative z-10">
              <p className="text-sm font-semibold text-stone-400">Métrica de Recuperação (Payback)</p>
              <div className="flex items-end gap-4 mt-2">
                <p className="text-3xl font-black">R$ {custoEfetivo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
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
              Inicie o mapeamento da sua rota saindo de Palmares rumo ao novo desafio na Secretaria de Estado. Cadastre os voos, ônibus e auxílios-mudança.
            </p>
            <button 
              onClick={() => setDrawerAberto(true)} 
              className="mt-6 px-6 py-2.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              Criar Roteiro Inicial
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {viagens.map((viagem) => (
              <div key={viagem.id} className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-stone-100 dark:border-stone-800 flex justify-between items-center">
                  <h3 className="font-bold text-xl">{viagem.titulo}</h3>
                  <span className="px-3 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    {viagem.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="p-6 bg-stone-50/50 dark:bg-stone-950/50">
                  <h4 className="text-sm font-bold text-stone-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Ticket size={16} /> Cartões de Embarque & Logística
                  </h4>
                  {/* Aqui renderizaremos os trechos em formato de passagem */}
                  <p className="text-sm text-stone-500 italic">Nenhum trecho logístico cadastrado ainda. Em breve: Adicionar Voos e Ônibus.</p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Componente Invisível que só aparece ao clicar no botão */}
      <DrawerViagem 
        aberto={drawerAberto} 
        fechar={() => setDrawerAberto(false)} 
        aoSalvar={buscarViagens} 
      />
    </>
  );
}