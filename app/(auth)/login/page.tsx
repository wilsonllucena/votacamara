import { LoginForm } from "@/components/auth/LoginForm"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | VotaCâmara",
  description: "Acesse o painel do sistema de votação",
}

export default function LoginPage() {
  return <LoginForm />
}
