"use client";

import { useState, useEffect } from "react";
import { X, Home, MapPin, Wifi, FileText, Search, UserPlus, Save, Loader2, AtSign, Phone, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type DrawerCasaConfigProps = {
  aberto: boolean;
  fechar: () => void;
  aoSalvar: () => void;
};

export default function DrawerCasaConfig({ aberto, fechar, aoSalvar }: DrawerCasaConfigProps) {
  const [salvando, setSalvando] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<"info" | "moradores">("info");

  // Estados: Info da Casa
  const [casaId, setCasaId] = useState<string | null>(null);
  const [nomeCasa, setNomeCasa] = useState("");
  const [endereco, setEndereco] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiSenha, setWifiSenha] = useState("");
  const [regras, setRegras] = useState("");

  // Estados: Busca de Moradores (Modo Social)
  const [termoBusca, setTermoBusca] = useState("");
  const [moradoresAtuais, setMoradoresAtuais] = useState<any[]>([]);

  useEffect(() => {
    if (aberto) {
      buscarDadosCasa();
      buscarMoradores();
    }
  }, [aberto]);

  const buscarDadosCasa = async () => {
    const { data } = await supabase.from("configuracoes_casa").select("*").limit(1).single();
    if (data) {
      setCasaId(data.id);
      setNomeCasa(data.nome || "");
      setEndereco(data.endereco || "");
      setWifiSsid(data.wifi_ssid || "");
      setWifiSenha(data.wifi_senha || "");
      setRegras(data.regras_gerais || "");
    }
  };

  const buscarMoradores = async () => {
    const { data } = await supabase.from("moradores").select("*").order("criado_em", { ascending: true });
    if (data) setMoradoresAtuais(data);
  };

  const handleSalvarInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    const toastId = toast.loading("A atualizar configurações...");

    const dados = { nome: nomeCasa, endereco, wifi_ssid: wifiSsid, wifi_senha: wifiSenha, regras_gerais: regras };

    try {
      if (casaId) {
        await supabase.from("configuracoes_casa").update(dados).eq("id", casaId);
      } else {
        await supabase.from("configuracoes_casa").insert([dados]);
      }
      toast.success("Casa atualizada com sucesso! 🏠", { id: toastId });
      aoSalvar();
    } catch (error) {
      toast.error("Erro ao salvar.", { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  // 🧠 Simulador de Adição via Match de Rede Social
  const handleAdicionarMorador = async () => {
    if (!termoBusca) return toast.error("Digite um @username, email ou telefone.");
    
    setSalvando(true);
    const toastId = toast.loading("Buscando usuário na rede Baply...");
    
    // Numa versão final, aqui fariamos um `select` na tabela global `perfis_publicos`. 
    // Para esta etapa, vamos simular a inserção do convite/match direto na nossa base.
    
    let tipoBusca = "nome";
    let valorBusca = termoBusca;
    let username = termoBusca.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (termoBusca.includes("@") && !termoBusca.includes(".")) {
      tipoBusca = "username";
    } else if (termoBusca.includes("@") && termoBusca.includes(".")) {
      tipoBusca = "email";
      username = termoBusca.split("@")[0];
    } else if (/\d/.test(termoBusca)) {
      tipoBusca = "telefone";
    }

    try {
      // Simula um delay de busca na rede
      await new Promise(resolve => setTimeout(resolve, 800));

      const { error } = await supabase.from("moradores").insert([{
        nome: tipoBusca === "nome" ? termoBusca : `Usuário (${username})`,
        username: username,
        email: tipoBusca === "email" ? termoBusca : null,
        telefone: tipoBusca === "telefone" ? termoBusca : null
      }]);

      if (error) throw error;
      
      toast.success("Usuário encontrado e adicionado com sucesso! 🤝", { id: toastId });
      setTermoBusca("");
      buscarMoradores();
      aoSalvar();
    } catch (error) {
      toast.error("Erro ao adicionar morador.", { id: toastId });
    } finally {
      setSalvando(false);
    }
  };

  if (!aberto) return null;

  return (
    <>
      <div onClick={fechar} className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-40 animate-in fade-in duration-300" />

      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-stone-950 shadow-2xl border-l border-stone-200 dark:border-stone-800 z-50 animate-in slide-in-from-right duration-500 flex flex-col">
        
        <div className="p-6 border-b border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Home size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-stone-900 dark:text-stone-100 leading-tight">Configuração da Casa</h3>
              </div>
            </div>
            <button onClick={fechar} className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors"><X size={20} /></button>
          </div>

          {/* Abas */}
          <div className="flex gap-2 p-1 bg-stone-100 dark:bg-stone-900 rounded-xl">
            <button onClick={() => setAbaAtiva("info")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${abaAtiva === "info" ? "bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white" : "text-stone-500 hover:text-stone-700"}`}>Detalhes Físicos</button>
            <button onClick={() => setAbaAtiva("moradores")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${abaAtiva === "moradores" ? "bg-white dark:bg-stone-800 shadow-sm text-stone-900 dark:text-white" : "text-stone-500 hover:text-stone-700"}`}>Coparticipantes</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {abaAtiva === "info" ? (
            <form id="form-casa" onSubmit={handleSalvarInfo} className="space-y-6 animate-in fade-in">
              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400">Nome de Identificação</label>
                <input value={nomeCasa} onChange={(e) => setNomeCasa(e.target.value)} type="text" placeholder="Ex: Sede Maranhão" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><MapPin size={16} /> Endereço Completo</label>
                <textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={2} placeholder="Rua, Número, Bairro, CEP..." className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><Wifi size={16} /> Rede Wi-Fi</label>
                  <input value={wifiSsid} onChange={(e) => setWifiSsid(e.target.value)} type="text" placeholder="Nome da Rede" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm shadow-sm" />
                </div>
                <div className="space-y-2 group">
                  <label className="text-sm font-semibold text-stone-600 dark:text-stone-400">Senha Wi-Fi</label>
                  <input value={wifiSenha} onChange={(e) => setWifiSenha(e.target.value)} type="text" placeholder="Senha" className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm shadow-sm font-mono" />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-sm font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-2"><FileText size={16} /> Regras ou Avisos Gerais</label>
                <textarea value={regras} onChange={(e) => setRegras(e.target.value)} rows={3} placeholder="Regras de convivência, portaria, lixo..." className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none text-sm" />
              </div>
            </form>
          ) : (
            <div className="space-y-6 animate-in fade-in">
              {/* O Motor de Busca Estilo Rede Social */}
              <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <h4 className="text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-1">Adicionar Coparticipante</h4>
                <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mb-3">O sistema enviará um convite seguro. Nenhum dado financeiro do seu perfil será compartilhado (LGPD).</p>
                
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-indigo-400">
                      <Search size={16} />
                    </div>
                    <input 
                      value={termoBusca} 
                      onChange={(e) => setTermoBusca(e.target.value)} 
                      type="text" 
                      placeholder="@username, email ou celular" 
                      className="w-full bg-white dark:bg-stone-900 border border-indigo-200 dark:border-indigo-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                  <button onClick={handleAdicionarMorador} disabled={salvando} className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-sm">
                    {salvando ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                  </button>
                </div>
                <div className="flex gap-4 mt-2 px-1">
                  <span className="text-[10px] text-indigo-500 flex items-center gap-1 font-medium"><AtSign size={10}/> @joao.silva</span>
                  <span className="text-[10px] text-indigo-500 flex items-center gap-1 font-medium"><Mail size={10}/> joao@email.com</span>
                </div>
              </div>

              {/* Lista de Moradores */}
              <div>
                <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-3 flex items-center gap-2">Membros da Casa ({moradoresAtuais.length})</h4>
                <div className="space-y-2">
                  {moradoresAtuais.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 border border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                          {m.nome.substring(0,2)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{m.nome}</p>
                          {(m.username || m.email) && (
                            <p className="text-[10px] text-stone-400 font-mono">@{m.username || m.email.split('@')[0]}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-1 bg-stone-200 dark:bg-stone-800 text-stone-500 rounded-md font-bold uppercase tracking-wider">Ativo</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {abaAtiva === "info" && (
          <div className="p-6 border-t border-stone-100 dark:border-stone-900 bg-stone-50/50 dark:bg-stone-900/20 flex gap-3">
            <button type="submit" form="form-casa" disabled={salvando} className="flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:translate-y-0">
              {salvando ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              <span>Salvar Detalhes</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}