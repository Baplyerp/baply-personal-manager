"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, Menu } from "lucide-react";

// Recebemos a função do Layout
export default function Header({ abrirMenu }: { abrirMenu: () => void }) {
  const { theme, setTheme } = useTheme();

  return (
    // left-0 no celular, left-[104px] no PC
    <header className="fixed top-0 right-0 left-0 md:left-[104px] h-20 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md z-30 flex items-center justify-between px-4 md:px-8 transition-all duration-300 border-b border-stone-200 dark:border-stone-800">
      
      <div className="flex items-center gap-4">
        {/* Botão Hambúrguer visível apenas no Mobile */}
        <button 
          onClick={abrirMenu}
          className="md:hidden p-2 -ml-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100 hidden sm:block">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <button className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
          <Bell size={20} className="text-stone-600 dark:text-stone-400" />
        </button>
        
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
        >
          {theme === "dark" ? (
            <Sun size={20} className="text-stone-400 hover:text-stone-100" />
          ) : (
            <Moon size={20} className="text-stone-600 hover:text-stone-900" />
          )}
        </button>

        <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-[#A67B5B] flex items-center justify-center text-white font-bold shadow-sm text-sm md:text-base ml-2">
          JB
        </div>
      </div>
    </header>
  );
}