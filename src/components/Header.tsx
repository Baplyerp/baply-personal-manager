"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Menu, User as UserIcon, Settings, LogOut } from "lucide-react";
import { usePerfil } from "@/contexts/PerfilContext";
import Link from "next/link";

export default function Header({ abrirMenu }: { abrirMenu: () => void }) {
  const { theme, setTheme } = useTheme();
  const { perfil } = usePerfil();
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora dele
  useEffect(() => {
    const handleClickFora = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  // Inteligência de Nomes e Iniciais
  const primeiroNome = perfil?.nome ? perfil.nome.split(" ")[0] : "Visitante";
  const inicial = perfil?.nome ? perfil.nome.charAt(0).toUpperCase() : "B";

  // Saudação baseada no horário local
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[104px] h-20 bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-300 border-b border-stone-200/50 dark:border-stone-800/50 shadow-sm">
      
      {/* Lado Esquerdo: Saudação e Menu Mobile */}
      <div className="flex items-center gap-4">
        <button onClick={abrirMenu} className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors">
          <Menu size={24} />
        </button>
        <div className="hidden sm:block animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">{saudacao}, {primeiroNome}</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Seu ecossistema está pronto.</p>
        </div>
      </div>
      
      {/* Lado Direito: Ações e Perfil */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Botões de Ação (Notificação e Tema) */}
        <div className="flex items-center gap-1 mr-2 border-r border-stone-200 dark:border-stone-800 pr-4">
          <button className="relative p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors group">
            <Bell size={20} className="text-stone-600 dark:text-stone-400 group-hover:text-[#A67B5B] transition-colors" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-stone-950"></span>
          </button>
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors group">
            {theme === "dark" ? <Sun size={20} className="text-stone-400 group-hover:text-amber-400 transition-colors" /> : <Moon size={20} className="text-stone-600 group-hover:text-indigo-600 transition-colors" />}
          </button>
        </div>

        {/* Menu do Usuário Interativo */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownAberto(!dropdownAberto)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-stone-50 dark:hover:bg-stone-900/50 transition-all border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
          >
            {/* Avatar Inteligente */}
            {perfil?.avatar_url ? (
              <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-sm overflow-hidden border-2 border-white dark:border-stone-800 group-hover:border-[#A67B5B] transition-colors">
                <img src={perfil.avatar_url} alt="Perfil" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#A67B5B] to-[#8a6347] flex items-center justify-center text-white font-bold shadow-sm border-2 border-white dark:border-stone-800 group-hover:shadow-[#A67B5B]/30 transition-all">
                {inicial}
              </div>
            )}
            
            {/* Nome e Tag (Visível apenas em telas maiores) */}
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-stone-700 dark:text-stone-200 leading-tight">{primeiroNome}</p>
              <p className="text-[10px] text-[#A67B5B] uppercase tracking-wider font-black truncate max-w-[100px]">{perfil?.cargo || "Configurar Perfil"}</p>
            </div>
          </button>

          {/* Dropdown Menu Flutuante */}
          {dropdownAberto && (
            <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-100 dark:border-stone-800 py-2 animate-in fade-in zoom-in-95 duration-200 z-50 origin-top-right">
              <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800 mb-2 bg-stone-50/50 dark:bg-stone-950/50">
                <p className="text-sm font-bold text-stone-900 dark:text-stone-50">{perfil?.nome || "Visitante"}</p>
                <p className="text-xs text-stone-500 truncate">{perfil?.empresa_nome || "Nenhuma organização vinculada"}</p>
              </div>
              
              <Link href="/dashboard/configuracoes" onClick={() => setDropdownAberto(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#A67B5B] transition-colors font-medium">
                <UserIcon size={18} /> Meu Crachá & Identidade
              </Link>
              <Link href="/dashboard/configuracoes" onClick={() => setDropdownAberto(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-[#A67B5B] transition-colors font-medium">
                <Settings size={18} /> Configurações do Sistema
              </Link>
              
              <div className="h-px bg-stone-100 dark:bg-stone-800 my-2"></div>
              
              <button onClick={() => setDropdownAberto(false)} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium">
                <LogOut size={18} /> Encerrar Sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}