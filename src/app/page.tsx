import { redirect } from "next/navigation";

export default function Home() {
  // Assim que a raiz for acessada, joga direto para o Dashboard
  redirect("/dashboard");
}