import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // 1. Recebemos os dados que o frontend (seu botão) vai enviar
    const body = await request.json();
    const { telefone, nome, valor, descricao, linkComprovante } = body;

    // 2. Validação de segurança básica
    if (!telefone || !nome) {
      return NextResponse.json(
        { success: false, message: "Telefone e nome são obrigatórios." },
        { status: 400 }
      );
    }

    // 3. Montando o texto luxuoso e padronizado
    const mensagemFormata = `Olá, *${nome}*! 👋\n\nO pagamento referente a *${descricao}* no valor de *R$ ${valor}* foi registrado no sistema.\n\n📄 Acesse seu comprovante seguro aqui: ${linkComprovante}\n\nQualquer dúvida, estou à disposição!`;

    // 4. Pegando as chaves do cofre (.env)
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;

    if (!apiUrl || !apiToken) {
      console.warn("⚠️ API do WhatsApp não configurada nas variáveis de ambiente. Simulando envio no console.");
      console.log("MENSAGEM SIMULADA PARA:", telefone, "\nTEXTO:\n", mensagemFormata);
      
      // Se não tiver chave ainda, fingimos que deu certo para você testar a interface!
      return NextResponse.json({ success: true, simulado: true });
    }

    // 5. O Disparo Real para a API do WhatsApp (exemplo padrão JSON)
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        number: telefone,
        text: mensagemFormata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na provedora de WhatsApp: ${response.statusText}`);
    }

    // 6. Retorno de Glória
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Erro na API de WhatsApp:", error);
    return NextResponse.json(
      { success: false, message: "Falha interna ao tentar enviar a mensagem." },
      { status: 500 }
    );
  }
}