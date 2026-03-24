"use client";

import { LayoutDashboard, FileSignature, Wallet, Users, Settings, X } from "lucide-react";
import Link from "next/link";

type SidebarProps = { aberto: boolean; fecharMenu: () => void; };

export default function Sidebar({ aberto, fecharMenu }: SidebarProps) {
  return (
    <>
      {aberto && <div onClick={fecharMenu} className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in" />}
      <aside className={`fixed top-0 left-0 h-screen w-[260px] md:w-[104px] bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 z-50 flex flex-col md:items-center py-8 transition-transform duration-300 ease-in-out ${aberto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center justify-between px-6 md:px-0 mb-12 w-full md:justify-center">
          <div className="h-12 w-12 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-white dark:text-stone-900 font-black text-xl">B.</span>
          </div>
          <button onClick={fecharMenu} className="md:hidden p-2 text-stone-500 hover:bg-stone-100 rounded-lg"><X size={24} /></button>
        </div>
        <nav className="flex flex-col gap-2 md:gap-6 w-full px-4 md:px-0 md:items-center">
          <Link href="/dashboard" className="flex items-center gap-4 p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#A67B5B] transition-colors"><LayoutDashboard size={24} className="shrink-0" /><span className="md:hidden font-medium">Dashboard</span></Link>
          <Link href="#" className="flex items-center gap-4 p-3 rounded-xl text-stone-500 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><FileSignature size={24} className="shrink-0" /><span className="md:hidden font-medium">Contratos</span></Link>
          <Link href="#" className="flex items-center gap-4 p-3 rounded-xl text-stone-500 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"><Wallet size={24} className="shrink-0" /><span className="md:hidden font-medium">Financeiro</span></Link>
        </nav>
        <div className="mt-auto px-4 md:px-0 w-full md:flex md:justify-center">
          <button className="flex items-center gap-4 p-3 w-full md:w-auto rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 transition-colors"><Settings size={24} className="shrink-0" /><span className="md:hidden font-medium">Configurações</span></button>
        </div>
      </aside>
    </>
  );
}