"use client";

import { useState, useEffect, useRef } from "react";
import { Settings, User, Briefcase, Wallet, Target, Save, Loader2, ShieldCheck, Building, MapPin, Link as LinkIcon, Image as ImageIcon, Camera } from "lucide-react";
import { usePerfil } from "@/contexts/PerfilContext";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function ConfiguracoesPage() {
  const { perfil, atualizarPerfil } = usePerfil();
  const [salvando, setSalvando] = useState(false);

  // Referências para os inputs de arquivo ocultos
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Estados Locais (Identidade)
  const [nome, setNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Estados Locais (Vínculo)
  const [cargo, setCargo] = useState("");
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaLogoUrl, setEmpresaLogoUrl] = useState("");
  const [localTrabalho, setLocalTrabalho] = useState("");
  const [gestor, setGestor] = useState("");

  // Estados Locais (Financeiro)
  const [renda, setRenda] = useState("");

  useEffect(() => {
    if (perfil) {
      setNome(perfil.nome || "");
      setAvatarUrl(perfil.avatar_url || "");
      setCargo(perfil.cargo || "");
      setEmpresaNome(perfil.empresa_nome || "");
      setEmpresaLogoUrl(perfil.empresa_logo_url || "");
      setLocalTrabalho(perfil.local_trabalho || "");
      setGestor(perfil.gestor_imediato || "");
      setRenda(perfil.renda_mensal ? perfil.renda_mensal.toString() : "");
    }
  }, [perfil]);

  // Função mágica que converte a imagem em texto (Base64) para salvar direto no banco
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setUrl: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limita o tamanho do arquivo a ~2MB para não pesar o banco
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem é muito pesada. Escolha uma foto com menos de 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // O resultado é uma string gigante que o navegador entende como imagem
      setUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("Sincronizando identidade em todo o sistema...");

    try {
      const { error } = await supabase
        .from("perfil_global")
        .update({
          nome,
          avatar_url: avatarUrl,
          cargo,
          empresa_nome: empresaNome,
          empresa_logo_url: empresaLogoUrl,
          local_trabalho: localTrabalho,
          gestor_imediato: gestor,
          renda_mensal: parseFloat(renda.replace(",", ".") || "0"),
        })
        .eq("nome", perfil?.nome);

      if (error) throw error;

      await atualizarPerfil();
      toast.success("Crachá e credenciais atualizados com sucesso! ✨", { id: toastId });
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error.message}`, { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      
      {/* Inputs de Arquivo Ocultos */}
      <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => handleFileUpload(e, setEmpresaLogoUrl)} className="hidden" />
      <input type="file" accept="image/*" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, setAvatarUrl)} className="hidden" />

      {/* Cabeçalho */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50 flex items-center gap-3">
          <Settings className="text-[#A67B5B]" size={32} />
          Identidade Corporativa
        </h2>
        <p className="text-stone-500 dark:text-stone-400 mt-2">
          Gerencie seu vínculo institucional e base de cálculo financeiro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Coluna Esquerda: O Crachá Premium Interativo */}
        <div className="lg:col-span-1 sticky top-8">
          <div className="relative group w-full aspect-[3/4] rounded-3xl bg-gradient-to-b from-stone-900 via-stone-800 to-stone-950 shadow-2xl overflow-hidden border border-stone-700/50 flex flex-col transition-transform duration-500 hover:scale-[1.02]">
            
            {/* Efeito Holográfico */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 transform -translate-x-full group-hover:translate-x-full skew-x-12 z-20 pointer-events-none" />
            
            {/* Furo do Crachá no topo */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-stone-950 rounded-full border border-stone-800/50 shadow-inner z-10" />

            <div className="p-8 pt-12 flex-1 flex flex-col relative z-10">
              
              {/* Header do Crachá (Logo Clicável) */}
              <div className="flex items-center gap-3 mb-8">
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="group/logo cursor-pointer relative h-10 w-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                  title="Clique para alterar a logo da empresa"
                >
                  {/* Overlay escuro que aparece no hover para convidar ao clique */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/logo:opacity-100 transition-opacity z-10">
                    <Camera size={16} className="text-white" />
                  </div>
                  
                  {empresaLogoUrl ? (
                    <img src={empresaLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Building size={20} className="text-stone-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Vínculo Ativo</p>
                  <p className="text-sm font-bold text-white truncate">{empresaNome || "Nome da Organização"}</p>
                </div>
              </div>

              {/* Foto de Perfil Clicável */}
              <div className="flex justify-center mb-6">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#A67B5B] to-[#e6ccb8] rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="group/avatar cursor-pointer relative h-full w-full bg-stone-800 rounded-full border-2 border-white/20 overflow-hidden flex items-center justify-center hover:border-[#A67B5B] transition-all"
                    title="Clique para alterar sua foto de perfil"
                  >
                    {/* Overlay escuro no hover */}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity z-10">
                      <Camera size={24} className="text-white" />
                    </div>

                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-stone-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Dados do Usuário */}
              <div className="text-center space-y-2 mt-2">
                <h3 className="text-2xl font-black text-white leading-tight">{nome || "Nome do Profissional"}</h3>
                <p className="text-[#A67B5B] font-bold tracking-wide uppercase text-sm">{cargo || "Cargo / Função"}</p>
              </div>

              {/* Rodapé do Crachá */}
              <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-end text-xs text-stone-400">
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#A67B5B]" />
                  <span className="truncate max-w-[120px]">{localTrabalho || "Local não definido"}</span>
                </div>
                <ShieldCheck size={18} className="text-emerald-500 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Os Formulários Integrados */}
        <div className="lg:col-span-2 space-y-6">
          <form id="form-perfil" onSubmit={handleSalvar} className="p-8 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-8">
            
            {/* Seção 1: Identidade Pessoal */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-2">
                <User size={18} className="text-[#A67B5B]" /> Dados Pessoais
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500">Nome Principal</label>
                  <input required value={nome} onChange={(e) => setNome(e.target.value)} type="text" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500 flex items-center gap-1"><LinkIcon size={14}/> Link da Foto (Opcional)</label>
                  <input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} type="text" placeholder="Cole uma URL ou clique no crachá..." className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all text-stone-400 truncate" />
                </div>
              </div>
            </div>

            {/* Seção 2: Vínculo Empregatício */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-2">
                <Building size={18} className="text-[#A67B5B]" /> Vínculo Empregatício
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500">Cargo / Posição</label>
                  <input required value={cargo} onChange={(e) => setCargo(e.target.value)} type="text" placeholder="Ex: Trainee em Gestão Pública" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500">Órgão / Empresa</label>
                  <input required value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} type="text" placeholder="Ex: Sec. de Estado da Saúde do Maranhão" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500">Local (Cidade/Base)</label>
                  <input value={localTrabalho} onChange={(e) => setLocalTrabalho(e.target.value)} type="text" placeholder="Ex: São Luís - MA" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-500 flex items-center gap-1"><LinkIcon size={14}/> Link da Logo (Opcional)</label>
                  <input value={empresaLogoUrl} onChange={(e) => setEmpresaLogoUrl(e.target.value)} type="text" placeholder="Cole uma URL ou clique na logo..." className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all text-stone-400 truncate" />
                </div>
                <div className="space-y-2 group md:col-span-2">
                  <label className="text-sm font-semibold text-stone-500">Gestão Imediata (Opcional)</label>
                  <input value={gestor} onChange={(e) => setGestor(e.target.value)} type="text" placeholder="Nome do superior ou setor" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all" />
                </div>
              </div>
            </div>

            {/* Seção 3: Variáveis Financeiras */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-2 flex items-center gap-2">
                <Wallet size={18} className="text-[#A67B5B]" /> Base de Cálculo (Hub de Viagens)
              </h4>
              <div className="space-y-2 group w-full md:w-1/2">
                <label className="text-sm font-semibold text-stone-500">Renda Base / Bolsa (R$)</label>
                <input required value={renda} onChange={(e) => setRenda(e.target.value)} type="number" step="0.01" className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#A67B5B]/50 transition-all font-mono" />
                <p className="text-xs text-stone-400">Usado para calcular a métrica de Payback (Retorno) na sua transição.</p>
              </div>
            </div>

            {/* Botão Salvar Integrado */}
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={salvando} className="flex items-center gap-2 px-8 py-4 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-white text-stone-50 dark:text-stone-900 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 disabled:opacity-70 disabled:hover:-translate-y-0">
                {salvando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>{salvando ? "Emitindo Credenciais..." : "Salvar Identidade"}</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}