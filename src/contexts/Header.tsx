"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell } from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="fixed top-0 right-0 left-[104px] h-20 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md z-40 flex items-center justify-between px-8 transition-colors duration-300 border-b border-stone-200 dark:border-stone-800">
      <h1 className="text-xl font-semibold text-stone-800 dark:text-stone-100">Dashboard</h1>
      
      <div className="flex items-center gap-6">
        <button className="p-2 rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors">
          <Bell size={20} className="text-stone-600 dark:text-stone-400" />
        </button>
        
        {/* Botão de Troca de Tema */}
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

        {/* Avatar Placeholder */}
        <div className="h-10 w-10 rounded-full bg-[#A67B5B] flex items-center justify-center text-white font-bold shadow-sm">
          JB
        </div>
      </div>
    </header>
  );
}