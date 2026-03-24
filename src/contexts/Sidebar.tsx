"use client";

import { LayoutDashboard, FileSignature, Wallet, Users, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[104px] bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 z-50 flex flex-col items-center py-8 transition-colors duration-300">
      {/* Logo da Aplicação / Baply */}
      <div className="h-12 w-12 bg-stone-900 dark:bg-white rounded-xl flex items-center justify-center mb-12 shadow-sm">
        <span className="text-white dark:text-stone-900 font-black text-xl">B.</span>
      </div>

      <nav className="flex flex-col gap-6 w-full items-center">
        <Link href="/dashboard" className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-[#A67B5B] transition-colors" title="Dashboard">
          <LayoutDashboard size={24} />
        </Link>
        <Link href="#" className="p-3 rounded-xl text-stone-400 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Contratos & Acordos">
          <FileSignature size={24} />
        </Link>
        <Link href="#" className="p-3 rounded-xl text-stone-400 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Financeiro">
          <Wallet size={24} />
        </Link>
        <Link href="#" className="p-3 rounded-xl text-stone-400 hover:text-[#A67B5B] hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors" title="Locadores / Credores">
          <Users size={24} />
        </Link>
      </nav>

      <div className="mt-auto">
        <button className="p-3 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors">
          <Settings size={24} />
        </button>
      </div>
    </aside>
  );
}