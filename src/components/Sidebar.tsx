"use client";

import { LayoutDashboard, FileSignature, Wallet, Users, Settings, X } from "lucide-react";
import Link from "next/link";

type SidebarProps = { 
  aberto: boolean; 
  fecharMenu: () => void; 
};

export default function Sidebar({ aberto, fecharMenu }: SidebarProps) {
  return (
    <>
      {/* Overlay escuro no mobile */}
      {aberto && (
        <div 
          onClick={fecharMenu} 
          className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in" 
        />
      )}
      
      {/* Sidebar Principal */}
      <aside className={`fixed top-0 left-0 h-screen w-[260px] md:w-[104px] bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 z-50 flex flex-col md:items-center py-8 transition-transform duration-300 ease-in-out ${aberto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        
        {/* Logo e Fechar (Mobile) */}
        <div className="flex items-center justify-between px-6 md:px-0 mb-12 w-full md:justify-center">
          <div className="h-12 w-12 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white dark:text-stone-900 font-black text-xl">B.</span>
          </div>
          <button onClick={fecharMenu} className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Navegação Central */}
        <nav className="flex flex-col gap-2 md:gap-6 w-full px-4 md:px-0 md:items-center">
          
          <Link href="/dashboard" onClick={fecharMenu} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 hover:text-[#A67B5B] transition-colors" title="Visão Geral">
            <LayoutDashboard size={24} className="shrink-0" />
            <span className="md:hidden font-medium">Dashboard</span>
          </Link>
          
          <Link href="/dashboard/contratos" onClick={fecharMenu} className="flex items-center gap-4 p-3 rounded-xl text-stone-500 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Contratos & Acordos">
            <FileSignature size={24} className="shrink-0" />
            <span className="md:hidden font-medium">Contratos</span>
          </Link>

          <Link href="/dashboard/parceiros" onClick={fecharMenu} className="flex items-center gap-4 p-3 rounded-xl text-stone-500 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Ecossistema de Parceiros">
            <Users size={24} className="shrink-0" />
            <span className="md:hidden font-medium">Parceiros</span>
          </Link>
          
        </nav>

        {/* Navegação Inferior (Rodapé) */}
        <div className="mt-auto px-4 md:px-0 w-full md:flex md:justify-center">
          <Link href="/dashboard/configuracoes" onClick={fecharMenu} className="flex items-center gap-4 p-3 w-full md:w-auto rounded-xl text-stone-500 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Configurações do Perfil">
            <Settings size={24} className="shrink-0" />
            <span className="md:hidden font-medium">Configurações</span>
          </Link>
        </div>

      </aside>
    </>
  );
}