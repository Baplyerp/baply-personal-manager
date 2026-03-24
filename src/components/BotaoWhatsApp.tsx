"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BotaoWhatsApp() {
  const [enviando, setEnviando] = useState(false);

  const dispararComprovante = async () => {
    setEnviando(true);
    
    // Mostra um loading bonitão usando o Sonner
    const toastId = toast.loading("Preparando comprovante...");

    try {
      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telefone: "5511999999999", // Coloque o seu número para testar!
          nome: "Locador João",
          valor: "1.500,00",
          descricao: "Aluguel - Parcela 1",
          linkComprovante: "https://baply.com/recibo/123",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Comprovante enviado para o WhatsApp!", { id: toastId });
      } else {
        toast.error(data.message || "Erro ao enviar.", { id: toastId });
      }
    } catch (error) {
      toast.error("Falha na comunicação com o servidor.", { id: toastId });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <button
      onClick={dispararComprovante}
      disabled={enviando}
      className="flex items-center gap-2 px-4 py-2 bg-[#A67B5B] hover:bg-[#966d50] text-white rounded-xl font-medium transition-colors disabled:opacity-70"
    >
      {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      <span>{enviando ? "Enviando..." : "Enviar Comprovante"}</span>
    </button>
  );
}