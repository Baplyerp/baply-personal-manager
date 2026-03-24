import { ArrowUpRight, ArrowDownRight, DollarSign, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-50">Visão Geral</h2>
        <p className="text-stone-500 dark:text-stone-400 mt-2">Acompanhamento financeiro e contratos da transição.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Total Empréstimos</h3>
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400"><ArrowDownRight size={20} /></div>
          </div>
          <div className="mt-4"><span className="text-3xl font-bold text-stone-900 dark:text-stone-50">R$ 4.500</span></div>
        </div>

        <div className="p-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-500 dark:text-stone-400">Aluguel & Caução</h3>
            <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400"><FileText size={20} /></div>
          </div>
          <div className="mt-4"><span className="text-3xl font-bold text-stone-900 dark:text-stone-50">R$ 2.800</span></div>
        </div>

        <div className="p-6 bg-[#A67B5B] rounded-2xl border border-[#966d50] shadow-sm transition-all hover:shadow-md text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-stone-100">Próxima Parcela</h3>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white"><DollarSign size={20} /></div>
          </div>
          <div className="mt-4"><span className="text-3xl font-bold">R$ 450</span><p className="text-xs text-stone-200 mt-1">Amanhã</p></div>
        </div>
      </div>
    </div>
  );
}